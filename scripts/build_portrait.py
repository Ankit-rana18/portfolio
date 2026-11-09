"""Build a depth-based particle portrait from one photo.

  segmentation (hair / face / body skin / clothes)  -> silhouette + regions
  face landmarks (478 pts with depth)               -> real facial relief
  distance transforms of the masks                  -> rounded head / body depth
  CLAHE luminance + edges                           -> particle density & brightness

Usage: python -I build_portrait.py <photo> <models_dir> <out_dir> [count]
Writes: out_dir/points.bin, out_dir/meta.json, out_dir/preview.png
"""
import sys, os, json
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision
from scipy.interpolate import griddata

photo, model_dir, out_dir = sys.argv[1:4]
N = int(sys.argv[4]) if len(sys.argv) > 4 else 80000
os.makedirs(out_dir, exist_ok=True)
rng = np.random.default_rng(7)

bgr = cv2.imread(photo)
rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
H, W = rgb.shape[:2]

# ---------------------------------------------------------------- segmentation
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpp.BaseOptions(model_asset_path=os.path.join(model_dir, "selfie_multiclass.tflite")),
    output_category_mask=True, output_confidence_masks=True))
sr = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
cat = np.squeeze(sr.category_mask.numpy_view()).astype(np.uint8)
conf_bg = np.squeeze(sr.confidence_masks[0].numpy_view())
if cat.shape != (H, W):
    cat = cv2.resize(cat, (W, H), interpolation=cv2.INTER_NEAREST)
    conf_bg = cv2.resize(conf_bg, (W, H))

person = (1 - conf_bg)
person = cv2.GaussianBlur(person, (0, 0), 1.2)
mask = (person > 0.5).astype(np.uint8)
n, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
mask = (lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
cat = np.where(mask > 0, np.where(cat == 0, 4, cat), 0)  # unlabeled person pixels -> clothes

hair, face_skin, body_skin, clothes = (cat == 1), (cat == 3), (cat == 2) | (cat == 5), (cat == 4)
head = (hair | face_skin).astype(np.uint8)

# ---------------------------------------------------------------- face landmarks (on an upscaled head crop)
face = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=mpp.BaseOptions(model_asset_path=os.path.join(model_dir, "face_landmarker.task")), num_faces=1))
ys, xs = np.where(head > 0)
cx0, cy0 = xs.mean(), ys.mean()
half = max(np.ptp(xs), np.ptp(ys)) * 0.9
ox, oy = int(max(cx0 - half, 0)), int(max(cy0 - half, 0))
crop = rgb[oy:int(min(cy0 + half, H)), ox:int(min(cx0 + half, W))]
s = 640 / crop.shape[0]
crop = np.ascontiguousarray(cv2.resize(crop, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC))
fr = face.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=crop))
assert fr.face_landmarks, "no face found"
cw, ch = crop.shape[1], crop.shape[0]
lm = np.array([[p.x * cw / s + ox, p.y * ch / s + oy, p.z * cw / s] for p in fr.face_landmarks[0]])
F = lm[:, 1].max() - lm[:, 1].min()          # face height in px — our unit of measure
face_cx = lm[:, 0].mean()

# ---------------------------------------------------------------- crop to head + upper body
top = ys.min() - 0.25 * F
bottom = top + 4.4 * F
y0, y1 = int(max(top, 0)), int(min(bottom, H))
rows = np.where(mask[y0:y1].any(1))[0]
cols = np.where(mask[y0:y1].any(0))[0]
x0, x1 = int(max(cols.min() - 0.6 * F, 0)), int(min(cols.max() + 0.6 * F, W))
sl = (slice(y0, y1), slice(x0, x1))
M = mask[sl]; C = cat[sl]; IMG = bgr[sl]
h, w = M.shape

# ---------------------------------------------------------------- luminance & edges
labimg = cv2.cvtColor(IMG, cv2.COLOR_BGR2LAB)
L = labimg[:, :, 0]
clahe = cv2.createCLAHE(clipLimit=2.6, tileGridSize=(8, 8)).apply(L).astype(np.float32) / 255

def stretch(v, m, lo=2, hi=98):
    a, b = np.percentile(v[m], [lo, hi])
    return np.clip((v - a) / max(b - a, 1e-3), 0, 1)

lum = np.zeros_like(clahe)
for m in (C == 1, C == 3, (C == 2) | (C == 5), C == 4):
    if m.sum() > 50:
        lum[m] = stretch(clahe, m)[m]
gray_s = cv2.GaussianBlur(clahe, (0, 0), 0.8)
gx = cv2.Sobel(gray_s, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(gray_s, cv2.CV_32F, 0, 1, ksize=3)
edge = np.sqrt(gx * gx + gy * gy)
edge = np.clip(edge / np.percentile(edge[M > 0], 97), 0, 1) * M
# region boundaries (hairline, jaw/beard line, collar, sleeves) add structure
regb = np.zeros((h, w), np.float32)
for k in (1, 3, 4):
    regb = np.maximum(regb, cv2.morphologyEx((C == k).astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)).astype(np.float32))
edge = np.maximum(edge, regb * 0.8) * M

# ---------------------------------------------------------------- depth (in px, converted to units later)
def dome(m, scale):
    d = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5)
    dn = d / max(d.max(), 1)
    return np.sqrt(1 - (1 - dn) ** 2) * scale  # ellipse-like cross-section

head_c = ((C == 1) | (C == 3)).astype(np.uint8)
neck_hand = ((C == 2) | (C == 5)).astype(np.uint8)
torso = ((C == 4)).astype(np.uint8)
z_head = dome(head_c, 0.55 * F) + 0.42 * F
z_body = dome(torso | neck_hand, 0.5 * F)
z_neck = dome(neck_hand, 0.3 * F) + 0.2 * F

# facial relief from landmarks, blended into the head dome inside the face hull
lmc = lm - [x0, y0, 0]
rel = -(lmc[:, 2] - lmc[:, 2].max())            # 0 at the furthest landmark, + toward camera
rel = rel / max(rel.max(), 1) * 0.42 * F
yy, xx = np.mgrid[0:h, 0:w]
face_z = griddata(lmc[:, :2], rel, (xx, yy), method="linear")
hull = np.zeros((h, w), np.uint8)
cv2.fillConvexPoly(hull, cv2.convexHull(lmc[:, :2].astype(np.int32)), 1)
fw = cv2.GaussianBlur(hull.astype(np.float32), (0, 0), 0.06 * F) * hull
face_base = np.median(z_head[(hull > 0) & (cv2.erode(hull, np.ones((9, 9))) == 0)])
z_face = np.nan_to_num(face_z, nan=0) + face_base

Z = np.zeros((h, w), np.float32)
Z = np.where(torso > 0, z_body, Z)
Z = np.where(neck_hand > 0, np.maximum(z_neck, z_body * 0.8), Z)
Z = np.where(head_c > 0, z_head * (1 - fw) + z_face * fw, Z)
Z = Z.astype(np.float32)
Z = (cv2.GaussianBlur(Z, (0, 0), 1.5) * M + Z * (1 - M)).astype(np.float32)
dzdx = cv2.Sobel(Z, cv2.CV_32F, 1, 0, ksize=5) / 32; dzdy = cv2.Sobel(Z, cv2.CV_32F, 0, 1, ksize=5) / 32

# ---------------------------------------------------------------- sampling
region = np.select([C == 3, C == 1, (C == 2) | (C == 5), C == 4], [0, 1, 2, 3], 3)
base = np.select([region == 0, region == 1, region == 2, region == 3], [1.0, 0.85, 0.6, 0.42])
weight = M * base * (0.35 + 0.65 * lum ** 0.8 + 1.6 * edge)
weight[hull > 0] *= 2.0

n_main = int(N * 0.8); n_halo = int(N * 0.08); n_back = N - n_main - n_halo
p = weight.ravel() / weight.sum()
# Stratified sampling: each pixel gets floor(expected) points plus one more with the
# leftover probability. Far less clumping than drawing with replacement.
expected = p * n_main
k = np.floor(expected).astype(np.int64) + (rng.random(p.size) < (expected - np.floor(expected)))
idx = np.repeat(np.arange(p.size), k)
if len(idx) > n_main:
    idx = rng.choice(idx, n_main, replace=False)
n_main = len(idx)
n_back = N - n_main - n_halo
py, px = np.divmod(idx, w)
jx, jy = rng.random(n_main) - 0.5, rng.random(n_main) - 0.5

def to_units(x, y):
    unit = 0.85 / F                            # face height = 0.85 scene units
    X = (x + x0 - face_cx) * unit
    Y = -(y + y0 - (top + 1.0 * F)) * unit     # head centre near y ≈ 0
    return X, Y, unit

X, Y, unit = to_units(px + jx, py + jy)
Zm = Z[py, px] * unit + (rng.random(n_main) - 0.5) * 0.004
nx, ny = -dzdx[py, px], dzdy[py, px]
nz = np.ones_like(nx)
nl = np.sqrt(nx * nx + ny * ny + nz * nz)
NX, NY = nx / nl, ny / nl
LUM = lum[py, px]; REG = region[py, px]; EDG = edge[py, px]

# halo: particles drifting off the outer silhouette
outline = cv2.morphologyEx(M, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
oy_, ox_ = np.where(outline > 0)
pick = rng.integers(0, len(ox_), n_halo)
blur = cv2.GaussianBlur(M.astype(np.float32), (0, 0), 6)
bx, by = cv2.Sobel(blur, cv2.CV_32F, 1, 0, ksize=5), cv2.Sobel(blur, cv2.CV_32F, 0, 1, ksize=5)
gxv, gyv = -bx[oy_[pick], ox_[pick]], -by[oy_[pick], ox_[pick]]
gl = np.sqrt(gxv ** 2 + gyv ** 2) + 1e-6
dist = rng.exponential(0.12 * F, n_halo)
hx = ox_[pick] + gxv / gl * dist + rng.normal(0, 0.03 * F, n_halo)
hy = oy_[pick] + gyv / gl * dist + rng.normal(0, 0.03 * F, n_halo)
HX, HY, _ = to_units(hx, hy)
HZ = Z[oy_[pick], ox_[pick]] * unit * rng.random(n_halo)

# back shell: a dim mirrored surface so the form keeps volume when it turns a little
bidx = rng.choice(p.size, n_back, p=(M * base).ravel() / (M * base).sum())
bpy, bpx = np.divmod(bidx, w)
BX, BY, _ = to_units(bpx + rng.random(n_back) - 0.5, bpy + rng.random(n_back) - 0.5)
BZ = -Z[bpy, bpx] * unit * 0.55 - 0.03

allX = np.concatenate([X, HX, BX]); allY = np.concatenate([Y, HY, BY]); allZ = np.concatenate([Zm, HZ, BZ])
allNX = np.concatenate([NX, gxv / gl * 0.9, -NX[: n_back] if n_back <= n_main else np.zeros(n_back)])
allNY = np.concatenate([NY, -gyv / gl * 0.9, NY[: n_back] if n_back <= n_main else np.zeros(n_back)])
allL = np.concatenate([LUM, np.full(n_halo, 0.35), lum[bpy, bpx] * 0.5])
allR = np.concatenate([REG, np.full(n_halo, 4), np.full(n_back, 5)])
allE = np.concatenate([EDG, np.zeros(n_halo), np.zeros(n_back)])

order = rng.permutation(N)   # shuffled so any prefix is an even subset (used on phones)
q = 8000.0
xyz = np.stack([allX, allY, allZ], 1)[order]
nrm = np.stack([allNX, allNY], 1)[order]
att = np.stack([allL * 255, allR, allE * 255], 1)[order]
with open(os.path.join(out_dir, "points.bin"), "wb") as f:
    f.write(np.clip(np.round(xyz * q), -32767, 32767).astype("<i2").tobytes())
    f.write(np.clip(np.round(nrm * 127), -127, 127).astype("i1").tobytes())
    f.write(np.clip(np.round(att), 0, 255).astype("u1").tobytes())
meta = {"count": N, "scale": 1 / q, "layout": ["int16 xyz", "int8 nx,ny", "uint8 lum,region,edge"],
        "regions": {"0": "face", "1": "hair", "2": "skin", "3": "clothes", "4": "halo", "5": "back"},
        "bounds": {"minY": float(allY.min()), "maxY": float(allY.max()), "minX": float(allX.min()), "maxX": float(allX.max())},
        "source": os.path.basename(photo)}
with open(os.path.join(out_dir, "meta.json"), "w") as f:
    json.dump(meta, f, indent=1)

# ---------------------------------------------------------------- preview (front + 3/4 view) for quick checks
def splat(angle, size=700):
    c, s_ = np.cos(angle), np.sin(angle)
    x = allX * c + allZ * s_; y = allY
    img = np.zeros((size, size), np.float32)
    u = ((x - x.mean()) / 4.2 + 0.5) * size; v = (0.5 - (y - (allY.max() + allY.min()) / 2) / 4.2) * size
    ok = (u >= 0) & (u < size) & (v >= 0) & (v < size)
    np.add.at(img, (v[ok].astype(int), u[ok].astype(int)), (0.25 + allL[ok]) * np.where(allR[ok] == 5, 0.2, 1))
    return np.clip(img / np.percentile(img[img > 0], 99) * 255, 0, 255).astype(np.uint8)

cv2.imwrite(os.path.join(out_dir, "preview.png"), np.hstack([splat(0), splat(0.6)]))
print(json.dumps({"N": N, "F_px": float(F), "crop": [x0, y0, x1, y1], "bytes": os.path.getsize(os.path.join(out_dir, "points.bin")), **meta["bounds"]}))
