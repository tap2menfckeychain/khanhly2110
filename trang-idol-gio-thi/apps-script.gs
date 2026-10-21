/**
 * KHO ẢNH CHO CÁC TRANG KỶ NIỆM — một kho dùng chung cho nhiều trang (mỗi khách một trang).
 *   • Trang tính "Trang": mỗi dòng là một trang — Mã trang | Mã quản lý | Ghi chú
 *       Mã trang phải trùng với maTrang trong data.js của trang đó.
 *       Mã quản lý là "mật khẩu" bạn gửi cho khách để khách tự thay ảnh.
 *   • Trang tính "Anh": ảnh khách đã tải lên (tự ghi). Có thể sửa chú thích ngay trong ô,
 *       gõ x vào cột "Ẩn" để ẩn một ảnh, hoặc xoá cả dòng.
 *   • File ảnh nằm trong Google Drive: thư mục "Ảnh trang kỷ niệm" / <mã trang>.
 * Cách cài: xem HUONG-DAN.txt, mục 6. Copy TOÀN BỘ nội dung file này dán vào Apps Script.
 */

var THU_MUC_GOC = 'Ảnh trang kỷ niệm';   // thư mục Drive chứa ảnh của mọi trang
var TOI_DA_ANH = 40;                      // số ảnh tối đa mỗi trang
var DUNG_LUONG_ANH = 4 * 1024 * 1024;     // mỗi ảnh tối đa 4 MB (trang quản lý đã tự nén ảnh trước khi gửi)
var SAI_TOI_DA = 8;                       // nhập sai mã quá 8 lần trong 15 phút thì tạm khoá trang đó

// Cột của trang tính "Anh" (đếm từ 0)
var C_TRANG = 0, C_ID = 1, C_CHU = 2, C_VITRI = 3, C_THUTU = 4, C_NGAY = 5, C_AN = 6;

/* Chạy hàm này MỘT LẦN sau khi dán code (chọn "caiDat" rồi bấm ▶ Chạy) để cấp quyền
   và tạo sẵn các trang tính, thư mục Drive. */
function caiDat() {
  bangTrang_();
  bangAnh_();
  thuMucGoc_();
  var sh = bangTrang_();
  if (sh.getLastRow() < 2) sh.appendRow(['gio-thi-01', String(Math.floor(100000 + Math.random() * 900000)), 'Trang mẫu — đổi mã quản lý nếu muốn']);
}

function bang_(ten, dau) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    sh.appendRow(dau);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), dau.length).setNumberFormat('@');   // giữ nguyên chữ, không tự đổi số
  }
  return sh;
}
function bangTrang_() { return bang_('Trang', ['Mã trang', 'Mã quản lý', 'Ghi chú']); }
function bangAnh_() { return bang_('Anh', ['Mã trang', 'Mã ảnh (Drive)', 'Chú thích', 'Vị trí', 'Thứ tự', 'Ngày tải', 'Ẩn (gõ x để ẩn)']); }

function thuMucGoc_() {
  var it = DriveApp.getFoldersByName(THU_MUC_GOC);
  return it.hasNext() ? it.next() : DriveApp.createFolder(THU_MUC_GOC);
}
function thuMucTrang_(trang) {
  var goc = thuMucGoc_();
  var it = goc.getFoldersByName(trang);
  return it.hasNext() ? it.next() : goc.createFolder(trang);
}

function traVe_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function lamSach_(s, toiDa) {
  s = String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, toiDa);
  if (/^[=+\-@]/.test(s)) s = "'" + s;   // chặn công thức trong Google Sheet
  return s;
}
function maTrangHopLe_(t) { return /^[A-Za-z0-9_-]{2,40}$/.test(String(t || '')); }

/* Kiểm tra mã quản lý của trang; trả về '' nếu đúng, hoặc mã lỗi */
function kiemTraMa_(trang, ma) {
  var cache = CacheService.getScriptCache(), khoa = 'sai:' + trang;
  var sai = Number(cache.get(khoa) || 0);
  if (sai >= SAI_TOI_DA) return 'tam-khoa';
  var rows = bangTrang_().getDataRange().getValues().slice(1);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== trang) continue;
    var dung = String(rows[i][1]).trim();
    if (dung && dung === String(ma == null ? '' : ma).trim()) return '';
    break;
  }
  cache.put(khoa, String(sai + 1), 900);
  return 'sai-ma';
}

/* Danh sách ảnh của một trang, theo thứ tự */
function dsAnh_(trang) {
  var rows = bangAnh_().getDataRange().getValues().slice(1);
  var list = [];
  rows.forEach(function (r) {
    if (String(r[C_TRANG]).trim() !== trang) return;
    if (String(r[C_AN] == null ? '' : r[C_AN]).trim()) return;   // đã ẩn
    var id = String(r[C_ID]).trim();
    if (!/^[\w-]{10,}$/.test(id)) return;
    list.push({ id: id, chuThich: String(r[C_CHU] || ''), viTri: String(r[C_VITRI] || ''), thuTu: Number(r[C_THUTU]) || 0 });
  });
  list.sort(function (a, b) { return a.thuTu - b.thuTu; });
  return list.map(function (a) { return { id: a.id, chuThich: a.chuThich, viTri: a.viTri }; });
}

function taiLen_(trang, d) {
  var sh = bangAnh_();
  var rows = sh.getDataRange().getValues().slice(1).filter(function (r) { return String(r[C_TRANG]).trim() === trang; });
  if (rows.length >= TOI_DA_ANH) return { ok: false, loi: 'qua-nhieu' };
  var bytes = Utilities.base64Decode(String(d.duLieu || ''));
  if (bytes.length < 4 || bytes.length > DUNG_LUONG_ANH) return { ok: false, loi: 'anh-loi' };
  if (!(bytes[0] === -1 && bytes[1] === -40)) return { ok: false, loi: 'anh-loi' };   // chỉ nhận file JPEG thật (FF D8)
  var luc = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss');
  var f = thuMucTrang_(trang).createFile(Utilities.newBlob(bytes, 'image/jpeg', trang + '-' + luc + '.jpg'));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var thuTu = rows.reduce(function (m, r) { return Math.max(m, Number(r[C_THUTU]) || 0); }, 0) + 1;
  var chu = lamSach_(d.chuThich, 80), viTri = lamSach_(d.viTri, 20);
  sh.appendRow([trang, f.getId(), chu, viTri, String(thuTu), Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'), '']);
  return { ok: true, anh: { id: f.getId(), chuThich: chu, viTri: viTri } };
}

function xoa_(trang, id) {
  var sh = bangAnh_();
  var rows = sh.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][C_TRANG]).trim() === trang && String(rows[i][C_ID]).trim() === String(id)) {
      sh.deleteRow(i + 1);
      try { DriveApp.getFileById(String(id)).setTrashed(true); } catch (e) { /* file đã bị xoá tay */ }
      return { ok: true };
    }
  }
  return { ok: true };
}

/* Lưu thứ tự, chú thích và vị trí cắt mới cho các ảnh của trang */
function sapXep_(trang, ds) {
  if (!Array.isArray(ds)) return { ok: false, loi: 'khong-ro' };
  var viTri = {};
  ds.forEach(function (a, k) { if (a && a.id) viTri[String(a.id)] = { k: k + 1, chu: lamSach_(a.chuThich, 80), vt: lamSach_(a.viTri, 20) }; });
  var sh = bangAnh_();
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][C_TRANG]).trim() !== trang) continue;
    var m = viTri[String(rows[i][C_ID]).trim()];
    if (m) sh.getRange(i + 1, C_CHU + 1, 1, 3).setValues([[m.chu, m.vt, String(m.k)]]);
  }
  return { ok: true };
}

/* Trang web đọc danh sách ảnh: ?trang=<mã trang> */
function doGet(e) {
  var trang = String((e && e.parameter && e.parameter.trang) || '').trim();
  if (!maTrangHopLe_(trang)) return traVe_({ ok: true, anh: [] });
  return traVe_({ ok: true, anh: dsAnh_(trang) });
}

/* Trang quản lý gửi lệnh: kiemTra / taiLen / xoa / sapXep (luôn kèm mã trang + mã quản lý) */
function doPost(e) {
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return traVe_({ ok: false, loi: 'khong-ro' }); }
  var trang = String(d.trang || '').trim();
  if (!maTrangHopLe_(trang)) return traVe_({ ok: false, loi: 'sai-ma' });
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var loi = kiemTraMa_(trang, d.ma);
    if (loi) return traVe_({ ok: false, loi: loi });
    if (d.hanhDong === 'kiemTra') return traVe_({ ok: true, anh: dsAnh_(trang), toiDa: TOI_DA_ANH });
    if (d.hanhDong === 'taiLen') return traVe_(taiLen_(trang, d));
    if (d.hanhDong === 'xoa') return traVe_(xoa_(trang, d.id));
    if (d.hanhDong === 'sapXep') return traVe_(sapXep_(trang, d.ds));
    return traVe_({ ok: false, loi: 'khong-ro' });
  } finally {
    lock.releaseLock();
  }
}
