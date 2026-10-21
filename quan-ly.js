/* Trang quản lý ảnh cho chủ trang — gửi ảnh lên kho Google Drive qua Apps Script (apiAnh trong data.js) */
(function () {
  "use strict";

  const D = window.TRANG || {};
  const $ = (id) => document.getElementById(id);

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key);
      else localStorage.setItem(key, val);
    } catch (e) { /* trình duyệt chặn lưu trữ: bỏ qua */ }
    return null;
  }

  const API = String(D.apiAnh || "").trim();
  const MA_TRANG = String(D.maTrang || "").trim();
  const KHOA_MA = "trangNhac.maQuanLy:" + MA_TRANG;
  const KHOA_ANH = "trangNhac.anhKhach:" + MA_TRANG;   // trang chính lưu tạm danh sách ảnh ở đây
  const driveAnh = (id, w) => "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w" + w;
  const driveDu = (id, w) => "https://lh3.googleusercontent.com/d/" + encodeURIComponent(id) + "=w" + w;
  // Vị trí ảnh trên trang chính (đếm từ 0)
  const VAI_TRO = { 0: "Đầu trang · ảnh lớn", 1: "Khoảnh khắc · ảnh lớn", 2: "Khoảnh khắc · ảnh nhỏ", 3: "Đầu trang · polaroid", 4: "Vòng tròn cuối trang", 7: "Nền lời nhắn" };
  const VI_TRI = [["", "Giữ phần: tự động"], ["50% 10%", "Giữ phần trên (mặt)"], ["50% 45%", "Giữ phần giữa"], ["50% 85%", "Giữ phần dưới"]];
  const LOI = {
    "sai-ma": "Mã quản lý không đúng.",
    "tam-khoa": "Nhập sai quá nhiều lần — thử lại sau 15 phút nhé.",
    "qua-nhieu": "Trang đã đủ số ảnh tối đa. Xoá bớt ảnh cũ rồi thêm ảnh mới.",
    "anh-loi": "Ảnh không hợp lệ hoặc quá lớn.",
    "doc-anh": "Không đọc được ảnh này (thử chụp màn hình ảnh rồi tải ảnh chụp lên)."
  };
  const baoLoi = (e) => LOI[e && e.message] || "Không kết nối được kho ảnh, kiểm tra mạng rồi thử lại.";

  let ma = "", ds = [], coThayDoi = false, dangGui = 0;

  $("qlTen").textContent = (D.tenIdol || D.tenBai || "") + (MA_TRANG ? " · mã trang " + MA_TRANG : "");

  // gửi dạng text/plain để trình duyệt không chặn (không cần "preflight")
  async function goi(hanhDong, them) {
    const r = await fetch(API, { method: "POST", body: JSON.stringify(Object.assign({ hanhDong: hanhDong, trang: MA_TRANG, ma: ma }, them)) });
    const j = await r.json();
    if (!j || j.ok === false) throw new Error((j && j.loi) || "loi");
    return j;
  }
  const bao = (id, t) => { $(id).textContent = t || ""; };

  /* ---------- Nén ảnh trên máy: tối đa 1600px, JPEG ---------- */
  function nenAnh(file) {
    return new Promise((xong, hong) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * s));
        c.height = Math.max(1, Math.round(img.naturalHeight * s));
        const g = c.getContext("2d");
        g.fillStyle = "#fff";
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        xong(c.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); hong(new Error("doc-anh")); };
      img.src = url;
    });
  }

  /* ---------- Danh sách ảnh ---------- */
  function danhDau() {
    coThayDoi = true;
    $("qlLuu").disabled = false;
    $("qlLuu").classList.add("chinh");
    bao("qlBao", "Có thay đổi chưa lưu — bấm “Lưu thay đổi”.");
  }
  function veDs() {
    const ol = $("qlDs");
    ol.textContent = "";
    ds.forEach((a, i) => {
      const li = el("li", "ql-the" + (a.dangGui ? " dang-gui" : ""));
      const img = el("img");
      img.alt = "";
      img.loading = "lazy";
      if (a.xemTruoc) img.src = a.xemTruoc;
      else {
        img.onerror = () => { img.onerror = null; img.src = driveDu(a.id, 500); };
        img.src = driveAnh(a.id, 500);
      }
      if (a.viTri) img.style.objectPosition = a.viTri;

      const tt = el("div", "ql-tt");
      tt.append(el("b", "", "Ảnh " + (i + 1)), el("small", "", a.dangGui ? "Đang tải lên…" : VAI_TRO[i] || "Bộ sưu tập"));
      const cap = el("input", "ql-o");
      cap.placeholder = "Chú thích (vd: Ánh đèn đỏ)";
      cap.maxLength = 80;
      cap.value = a.chuThich || "";
      cap.disabled = !!a.dangGui;
      cap.oninput = () => { a.chuThich = cap.value; danhDau(); };
      const chon = el("select", "ql-o");
      VI_TRI.forEach(([v, t]) => { const o = el("option", "", t); o.value = v; chon.appendChild(o); });
      chon.value = VI_TRI.some((x) => x[0] === a.viTri) ? a.viTri || "" : "";
      chon.disabled = !!a.dangGui;
      chon.onchange = () => { a.viTri = chon.value; img.style.objectPosition = a.viTri; danhDau(); };
      tt.append(cap, chon);

      const nut = el("div", "ql-nut-nho");
      const len = el("button", "", "↑"), xuong = el("button", "", "↓"), xoa = el("button", "xoa", "✕");
      [len, xuong, xoa].forEach((b) => { b.type = "button"; b.disabled = !!a.dangGui; });
      len.title = "Lên trước";
      xuong.title = "Xuống sau";
      xoa.title = "Xoá ảnh";
      len.disabled = len.disabled || i === 0;
      xuong.disabled = xuong.disabled || i === ds.length - 1;
      len.onclick = () => { [ds[i - 1], ds[i]] = [ds[i], ds[i - 1]]; veDs(); danhDau(); };
      xuong.onclick = () => { [ds[i + 1], ds[i]] = [ds[i], ds[i + 1]]; veDs(); danhDau(); };
      xoa.onclick = async () => {
        if (!confirm("Xoá ảnh " + (i + 1) + " khỏi trang?")) return;
        xoa.disabled = true;
        try {
          await goi("xoa", { id: a.id });
          ds.splice(ds.indexOf(a), 1);
          store(KHOA_ANH, null);
          veDs();
          bao("qlBao", "Đã xoá ảnh." + (coThayDoi ? " Vẫn còn thay đổi chưa lưu." : ""));
        } catch (e) { xoa.disabled = false; bao("qlBao", baoLoi(e)); }
      };
      nut.append(len, xuong, xoa);

      li.append(img, tt, nut);
      ol.appendChild(li);
    });
    const that = ds.filter((a) => !a.dangGui).length;
    $("qlTrong").hidden = ds.length > 0;
    $("qlDem").textContent = that ? that + " ảnh" : "";
  }

  async function luu() {
    $("qlLuu").disabled = true;
    bao("qlBao", "Đang lưu…");
    try {
      await goi("sapXep", { ds: ds.filter((a) => !a.dangGui).map((a) => ({ id: a.id, chuThich: a.chuThich || "", viTri: a.viTri || "" })) });
      coThayDoi = false;
      $("qlLuu").classList.remove("chinh");
      store(KHOA_ANH, null);
      bao("qlBao", "Đã lưu ✓ Mở “← Xem trang” để xem ảnh mới.");
    } catch (e) {
      $("qlLuu").disabled = false;
      bao("qlBao", baoLoi(e));
    }
  }

  async function themAnh(files) {
    const moi = Array.from(files || []).filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name));
    if (!moi.length) return;
    const viec = moi.map((f) => {
      const a = { id: "", chuThich: "", viTri: "", dangGui: true, xemTruoc: URL.createObjectURL(f), file: f };
      ds.push(a);
      return a;
    });
    veDs();
    let xong = 0, hong = 0;
    for (const a of viec) {
      dangGui++;
      bao("qlBao", "Đang tải ảnh " + (xong + hong + 1) + " / " + viec.length + "… (đừng đóng trang)");
      try {
        const duLieu = await nenAnh(a.file);
        const j = await goi("taiLen", { duLieu: duLieu, chuThich: "", viTri: "" });
        Object.assign(a, j.anh, { dangGui: false });
        delete a.file;
        xong++;
      } catch (e) {
        ds.splice(ds.indexOf(a), 1);
        URL.revokeObjectURL(a.xemTruoc);
        hong++;
        bao("qlBao", baoLoi(e));
      }
      dangGui--;
      veDs();
    }
    store(KHOA_ANH, null);
    if (!hong) bao("qlBao", "Đã tải lên " + xong + " ảnh ✓ Thêm chú thích, sắp xếp rồi bấm “Lưu thay đổi” nếu cần.");
    else if (xong) bao("qlBao", "Đã tải lên " + xong + " ảnh, " + hong + " ảnh bị lỗi.");
  }

  /* ---------- Đăng nhập bằng mã quản lý ---------- */
  async function vao(maNhap, tuDong) {
    ma = String(maNhap || "").trim();
    if (!ma) return;
    $("qlVao").disabled = true;
    bao("qlBaoMa", "Đang kiểm tra…");
    try {
      const j = await goi("kiemTra");
      if ($("qlNho").checked) store(KHOA_MA, ma);
      ds = (j.anh || []).map((a) => ({ id: a.id, chuThich: a.chuThich || "", viTri: a.viTri || "" }));
      $("qlMa").hidden = true;
      $("qlAnh").hidden = false;
      veDs();
    } catch (e) {
      if (tuDong) store(KHOA_MA, null);
      bao("qlBaoMa", baoLoi(e));
    }
    $("qlVao").disabled = false;
  }

  if (!API || !MA_TRANG) {
    $("qlChuaNoi").hidden = false;
    return;
  }
  $("qlMa").hidden = false;
  $("qlFormMa").addEventListener("submit", (e) => { e.preventDefault(); vao($("qlMaO").value); });
  $("qlChon").addEventListener("change", (e) => { themAnh(e.target.files); e.target.value = ""; });
  $("qlLuu").addEventListener("click", luu);
  $("qlThoat").addEventListener("click", () => {
    if (coThayDoi && !confirm("Còn thay đổi chưa lưu. Vẫn thoát?")) return;
    store(KHOA_MA, null);
    coThayDoi = false;
    location.reload();
  });
  addEventListener("beforeunload", (e) => {
    if (coThayDoi || dangGui) { e.preventDefault(); e.returnValue = ""; }
  });
  const daNho = store(KHOA_MA);
  if (daNho) vao(daNho, true);
})();
