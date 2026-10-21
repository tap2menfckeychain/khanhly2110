/* Trang kỷ niệm idol — phần xử lý. Nội dung nằm trong data.js */
(function () {
  "use strict";

  const D = window.TRANG || {};
  const $ = (id) => document.getElementById(id);
  const body = document.body;
  const nhac = $("nhac");

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

  const pad = (n) => (n < 10 ? "0" : "") + n;
  const phutGiay = (s) => { s = isFinite(s) ? Math.max(0, Math.floor(s)) : 0; return Math.floor(s / 60) + ":" + pad(s % 60); };
  const kep = (x, a, b) => Math.min(b, Math.max(a, x));
  const ngauNhien = (a, b) => a + Math.random() * (b - a);
  const cho = (ms) => new Promise((ok) => setTimeout(ok, ms));
  // vị trí cuối cùng trong mảng đã sắp xếp có mốc <= t (-1 nếu chưa tới)
  function timViTri(ds, t, lay) {
    let lo = 0, hi = ds.length - 1, kq = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (lay(ds[m]) <= t) { kq = m; lo = m + 1; } else hi = m - 1;
    }
    return kq;
  }

  const GIAM_CHUYEN_DONG = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  // Mở trang trên máy mình (file:// hoặc localhost) thì hiện thêm nút chỉnh lời
  const CHE_DO_SOAN = location.protocol === "file:" || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const KHOA_LOI = "trangNhac.loiTam:" + (D.nhac || "");

  /* ---------- Gắn chữ ---------- */
  const TEN = D.tenBai || "";
  const CA_SI = D.caSi || "";
  const IDOL = D.tenIdol || "";
  // Ảnh mẫu trong data.js; khi khách đã tải ảnh lên kho (apiAnh) thì dùng ảnh của khách
  const ANH_MAU = (D.anh || []).map((a) => (typeof a === "string" ? { src: a } : a)).filter((a) => a.src);
  let ANH = ANH_MAU;
  const anhSo = (i) => ANH[i % Math.max(1, ANH.length)] || { src: "" };
  const API_ANH = String(D.apiAnh || "").trim();
  const MA_TRANG = String(D.maTrang || "").trim();
  const KHOA_ANH = "trangNhac.anhKhach:" + MA_TRANG;
  const driveAnh = (id, w) => "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w" + w;
  const driveDu = (id, w) => "https://lh3.googleusercontent.com/d/" + encodeURIComponent(id) + "=w" + w;
  function tuKho(ds) {
    return ds.filter((a) => a && /^[\w-]{10,}$/.test(a.id)).map((a) => ({
      src: driveAnh(a.id, 1600), du: driveDu(a.id, 1600), lon: driveAnh(a.id, 2200), chuThich: a.chuThich || "", viTri: a.viTri || ""
    }));
  }
  const nam = new Date().getFullYear();
  document.title = (IDOL ? IDOL + " — " : "") + TEN;

  // Dòng tiêu đề: chữ giữa hai dấu * hiện bằng font viết tay; mỗi chữ trồi lên khi cuộn tới
  function veTieuDe(h, dong) {
    h.textContent = "";
    let i = 0;
    (dong || []).forEach((d) => {
      const hang = el("span", "dong-td");
      String(d).split(/(\*[^*]+\*)/).forEach((doan) => {
        if (!doan) return;
        const tay = /^\*.*\*$/.test(doan);
        const noi = tay ? el("span", "tay") : hang;
        doan.replace(/^\*|\*$/g, "").split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { noi.appendChild(document.createTextNode(" ")); return; }
          const o = el("span", "tu-o"), c = el("span", "tu-c", w);
          c.style.setProperty("--i", i++);
          o.appendChild(c);
          noi.appendChild(o);
        });
        if (tay) hang.appendChild(noi);
      });
      h.appendChild(hang);
    });
  }
  function datAnh(img, a) {
    // ảnh Drive: link chính lỗi thì thử link dự phòng
    img.onerror = a.du ? () => { img.onerror = null; img.src = a.du; } : null;
    img.src = a.src;
    img.alt = a.chuThich || "";
    img.style.objectPosition = a.viTri || "";
  }
  const chu = (id, t) => { $(id).textContent = t || ""; };

  $("logoTen").textContent = IDOL || TEN;
  chu("quaNhan", (D.qua || {}).nhan);
  chu("quaGoiY", (D.qua || {}).goiY);

  const DAU = D.dau || {};
  chu("dauNhan", DAU.nhan);
  veTieuDe($("dauTieuDe"), DAU.tieuDe);
  chu("dauMoTa", DAU.moTa);
  chu("chuDoc", "No.01 — " + TEN.toUpperCase() + " — " + nam);

  const dai = $("daiChay");
  for (let lap = 0; lap < 2; lap++) {
    [TEN, CA_SI, IDOL || "KỶ NIỆM", "MEMORIES"].forEach((t) => {
      dai.append(el("span", "", t.toUpperCase()), el("span", "tay", "✦"));
    });
  }

  const CC = D.cauChuyen || {};
  chu("ccNhan", CC.nhan);
  veTieuDe($("ccTieuDe"), CC.tieuDe);
  chu("ccMoTa", CC.moTa);

  const KK = D.khoanhKhac || {};
  chu("kkNhan", KK.nhan);
  veTieuDe($("kkTieuDe"), KK.tieuDe);
  chu("kkMoTa", KK.moTa);
  chu("kkNut", KK.nut);

  const KN = D.kyNiem || {};
  chu("knNhan", KN.nhan);
  veTieuDe($("knTieuDe"), KN.tieuDe);
  chu("knMoTa", KN.moTa);
  chu("cpNhan", D.cuonPhim);

  const LN = D.loiNhan || {};
  chu("lnNhan", LN.nhan);
  veTieuDe($("lnTieuDe"), LN.tieuDe);
  (LN.doan || []).forEach((p) => $("lnThe").appendChild(el("p", "", p)));
  if (LN.kyTen) $("lnThe").appendChild(el("p", "ky-ten", LN.kyTen));

  const CT = D.cuoi || {};
  chu("ctNhan", CT.nhan);
  veTieuDe($("ctTieuDe"), CT.tieuDe);
  chu("ctNut", CT.nut);

  /* ---------- Đặt ảnh vào trang (chạy lại khi danh sách ảnh của khách thay đổi) ---------- */
  const XOAY = [-2.5, 2, -1.5, 3, -2, 1.5];
  function veAnh() {
    datAnh($("anhDau1"), anhSo(0));
    datAnh($("anhDau2"), anhSo(3));
    datAnh($("anhKk1"), anhSo(1));
    datAnh($("anhKk2"), anhSo(2));
    datAnh($("anhTron"), anhSo(4));
    $("lnNen").style.backgroundImage = 'url("' + anhSo(7).src + '")';

    const luoi = $("knLuoi"), moi = [];
    luoi.textContent = "";
    ANH.forEach((a, i) => {
      const f = el("figure", "kn-o hien");
      f.style.setProperty("--xoay", XOAY[i % XOAY.length] + "deg");
      const khung = el("div", "kn-anh"), img = el("img");
      img.loading = "lazy";
      img.decoding = "async";
      datAnh(img, a);
      khung.appendChild(img);
      const cap = el("figcaption");
      cap.append(el("b", "", pad(i + 1) + " / "), document.createTextNode(a.chuThich || ""));
      f.append(el("span", "kn-so", pad(i + 1)), khung, cap);
      if (i % 3 === 1) f.appendChild(el("i", "bang-keo"));
      f.addEventListener("click", () => moXem(i));
      luoi.appendChild(f);
      moi.push(f);
    });
    theoDoi(moi);

    [$("phim1"), $("phim2")].forEach((hang, k) => {
      hang.textContent = "";
      const ds = k ? ANH.slice().reverse() : ANH;
      // đủ dài để dải phim chạy vòng không bị hở, kể cả khi khách chỉ có vài ảnh
      const lap = Math.max(2, 2 * Math.ceil(16 / Math.max(1, ds.length)));
      for (let n = 0; n < lap; n++) {
        ds.forEach((a) => {
          const img = el("img");
          img.loading = "lazy";
          datAnh(img, a);
          img.alt = "";
          hang.appendChild(img);
        });
      }
    });

    if ("mediaSession" in navigator && typeof MediaMetadata !== "undefined" && ANH.length) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({ title: TEN, artist: CA_SI, artwork: [{ src: new URL(ANH[0].src, location.href).href }] });
      } catch (e) { /* bỏ qua */ }
    }
  }
  let dauAnh = "";
  function dungAnh(ds) {
    const moi = ds && ds.length ? tuKho(ds) : ANH_MAU;
    const dau = JSON.stringify(moi.map((a) => [a.src, a.chuThich, a.viTri]));
    if (dau === dauAnh) return;
    dauAnh = dau;
    ANH = moi.length ? moi : ANH_MAU;
    veAnh();
  }
  async function taiAnhKhach() {
    for (let lan = 0; lan < 3; lan++) {
      try {
        const ctl = window.AbortController ? new AbortController() : null;
        const hen = ctl && setTimeout(() => ctl.abort(), 9000);
        const r = await fetch(API_ANH + (API_ANH.indexOf("?") < 0 ? "?" : "&") + "trang=" + encodeURIComponent(MA_TRANG) + "&t=" + Date.now(),
          Object.assign({ cache: "no-store" }, ctl ? { signal: ctl.signal } : {}));
        clearTimeout(hen);
        const j = await r.json();
        if (j && j.ok && Array.isArray(j.anh)) {
          store(KHOA_ANH, JSON.stringify(j.anh));
          return j.anh;
        }
      } catch (e) { /* mạng chập chờn: thử lại */ }
      await cho(1200 + lan * 1500);
    }
    return null;
  }
  // Có ảnh đã lưu từ lần trước thì hiện ngay, đồng thời hỏi kho ảnh để cập nhật
  function batDauAnh() {
    if (!API_ANH || !MA_TRANG) { dungAnh([]); return Promise.resolve(); }
    $("qlLink").hidden = false;
    try { const cu = JSON.parse(store(KHOA_ANH) || "null"); if (Array.isArray(cu)) dungAnh(cu); } catch (e) { /* bỏ qua */ }
    return taiAnhKhach().then((ds) => {
      if (ds) dungAnh(ds);
      else if (!dauAnh) dungAnh([]);   // không tải được kho ảnh, chưa có gì để hiện: dùng ảnh mẫu
    });
  }

  const motVong = (TEN + " ✦ " + CA_SI + " ✦ " + (IDOL ? IDOL + " ✦ " : "")).toUpperCase();
  const chuTron = $("chuTron");
  chuTron.textContent = motVong.repeat(Math.max(1, Math.floor(540 / (Array.from(motVong).length * 11))));
  chuTron.setAttribute("textLength", "536");
  chuTron.setAttribute("lengthAdjust", "spacing");
  $("chanTrang").textContent = "Nhạc: “" + TEN + "” — " + CA_SI + " · Lời bài hát: LRCLIB · Làm bằng cả trái tim ♡";

  /* ---------- Lời bài hát (LRC) ---------- */
  function docLrc(chuLrc) {
    const ds = [];
    let lech = 0;
    String(chuLrc || "").split(/\r?\n/).forEach((dong) => {
      const off = /^\s*\[offset:\s*([+-]?\d+)\s*\]/i.exec(dong);
      if (off) { lech = +off[1] / 1000; return; }
      const re = /\[(\d{1,3}):(\d{1,2}(?:[.,]\d{1,3})?)\]/g;
      const moc = [];
      let m, cuoi = 0;
      while ((m = re.exec(dong))) { moc.push(+m[1] * 60 + parseFloat(m[2].replace(",", "."))); cuoi = re.lastIndex; }
      if (!moc.length) return;
      const text = dong.slice(cuoi).trim();
      moc.forEach((t) => ds.push({ t, text }));
    });
    // [offset:+500] nghĩa là lời hiện sớm hơn 0,5 giây
    ds.forEach((d) => (d.t = Math.max(0, d.t - lech)));
    return ds.sort((a, b) => a.t - b.t);
  }
  let LOI = [], nguonLoi = "", dangTaiLoi = false;

  // Tính thời gian "tô màu" từng câu (karaoke): dựa theo số chữ và khoảng cách tới câu sau
  function chuanBiLoi(tong) {
    tong = isFinite(tong) ? tong : 0;
    LOI.forEach((d, i) => {
      d.ket = i + 1 < LOI.length ? LOI[i + 1].t : Math.max(d.t + 8, tong);
      d.tu = d.text ? d.text.split(/\s+/).filter(Boolean) : [];
      d.nang = d.tu.map((w) => Array.from(w).length + 1);
      d.tong = d.nang.reduce((x, y) => x + y, 0);
      d.quet = Math.max(0.5, Math.min(d.tu.length * 0.36 + 0.5, d.ket - d.t - 0.25));
    });
  }
  function napLoi(chuLrc, nguon) {
    const ds = docLrc(chuLrc);
    if (!ds.length) return false;
    const lech = +D.lechLoi || 0;
    if (lech) ds.forEach((d) => (d.t = Math.max(0, d.t + lech)));
    LOI = ds;
    nguonLoi = nguon;
    chuanBiLoi(nhac.duration);
    trangThai = null;
    capNhatNhanSoan();
    if (dangSoan && !$("soanChu").value.trim()) $("soanChu").value = xuatLrc(LOI, false);
    return true;
  }
  // Lời có mốc thời gian, tải từ kho lời LRCLIB (lrclib.net); lưu lại để lần sau mở nhanh
  async function loiLrclib() {
    const c = D.loiTuDong;
    if (!c) return null;
    const url = c.id
      ? "https://lrclib.net/api/get/" + encodeURIComponent(c.id)
      : "https://lrclib.net/api/get?track_name=" + encodeURIComponent(c.tenBai || TEN) + "&artist_name=" + encodeURIComponent(c.caSi || CA_SI) +
        (c.thoiLuong ? "&duration=" + encodeURIComponent(c.thoiLuong) : "");
    const khoa = "trangNhac.lrclib:" + url;
    const daLuu = store(khoa);
    if (daLuu) return daLuu;
    for (let lan = 0; lan < 7; lan++) {
      try {
        const ctl = window.AbortController ? new AbortController() : null;
        const hen = ctl && setTimeout(() => ctl.abort(), 10000);
        const r = await fetch(url, ctl ? { signal: ctl.signal } : {});
        clearTimeout(hen);
        if (r.status === 404) return null;
        if (r.ok) {
          const j = await r.json();
          if (j && j.syncedLyrics) store(khoa, j.syncedLyrics);
          return (j && j.syncedLyrics) || null;
        }
      } catch (e) { /* mạng chập chờn hoặc máy chủ bận: thử lại */ }
      await cho(1500 + lan * 1500);
    }
    return null;
  }
  async function taiLoi() {
    const loiTam = CHE_DO_SOAN ? store(KHOA_LOI) : null;
    if (loiTam != null && napLoi(loiTam, "tam")) return;
    if (napLoi(window.LOI_BAI_HAT, "file")) return;
    dangTaiLoi = true;
    capNhatNhanSoan();
    const kq = await loiLrclib();
    dangTaiLoi = false;
    if (!kq || !napLoi(kq, "lrclib")) capNhatNhanSoan();
  }

  /* ---------- Lời bay: chữ bay vào từ mép phải, hát xong thì tung bay lên ---------- */
  const oLoi = $("oLoi");
  let trangThai = null, spanTu = [];
  function taoDong(cls, tu) {
    const p = el("p", cls);
    const ds = tu.map((w, j) => {
      if (j) p.appendChild(document.createTextNode(" "));
      const sp = el("span", "tu", w);
      p.appendChild(sp);
      return sp;
    });
    oLoi.appendChild(p);
    return ds;
  }
  function bayVao(ds) {
    if (GIAM_CHUYEN_DONG) return;
    const W = innerWidth;
    ds.forEach((w, i) => {
      const r = w.getBoundingClientRect();
      w.animate([
        { opacity: 0, transform: "translate(" + (W - r.left + ngauNhien(30, 140)) + "px," + ngauNhien(-70, 20) + "px) rotate(" + ngauNhien(10, 40) + "deg) scale(.7)", filter: "blur(6px)" },
        { opacity: 1, transform: "none", filter: "blur(0px)" }
      ], { duration: 950, delay: i * 65, easing: "cubic-bezier(.16,.84,.3,1)", fill: "backwards" });
    });
  }
  function bayDi(p) {
    p.classList.add("di");
    const ds = p.querySelectorAll(".tu");
    if (GIAM_CHUYEN_DONG) { p.remove(); return; }
    ds.forEach((w, i) => {
      w.animate([
        { opacity: 1, transform: "none", filter: "blur(0px)" },
        { opacity: 0, transform: "translate(" + -ngauNhien(10, 80) + "px," + -ngauNhien(50, 150) + "px) rotate(" + ngauNhien(-30, 30) + "deg) scale(.85)", filter: "blur(5px)" }
      ], { duration: 750, delay: i * 28, easing: "cubic-bezier(.45,0,.75,.4)", fill: "forwards" });
    });
    setTimeout(() => p.remove(), ds.length * 28 + 820);
  }
  // -1: trước câu đầu (hiện tên bài), -2: đoạn nhạc không lời, còn lại là số thứ tự câu đang hát
  function trangThaiLoi(t) {
    const i = timViTri(LOI, t + 0.1, (d) => d.t);
    if (i < 0) return -1;
    const d = LOI[i];
    if (!d.text) return -2;
    if (t > d.t + d.quet + 5 && d.ket - t > 3) return -2;
    return i;
  }
  function veLoi(s) {
    oLoi.querySelectorAll(".dong:not(.di)").forEach(bayDi);
    spanTu = [];
    if (s >= 0) spanTu = taoDong("dong", LOI[s].tu);
    const ds = s >= 0 ? spanTu : taoDong("dong ghi", s === -1 ? ["♪", TEN, "—", CA_SI] : ["♪", "♫", "♪"]);
    bayVao(ds);
  }
  function toMau(d, t) {
    let x = kep((t - d.t) / d.quet, 0, 1) * d.tong;
    for (let j = 0; j < spanTu.length; j++) {
      const w = d.nang[j];
      const f = Math.round(kep(x / (w - 0.6), 0, 1) * 124 - 12);
      x -= w;
      const sp = spanTu[j];
      if (sp._f !== f) { sp._f = f; sp.style.setProperty("--f", f + "%"); }
    }
  }
  function capNhatLoi(t) {
    const s = LOI.length ? trangThaiLoi(t) : -1;
    if (s !== trangThai) { veLoi(s); trangThai = s; }
    if (s >= 0) toMau(LOI[s], t);
  }
  const nutLoi = $("nutLoi");
  function datHienLoi(bat) {
    body.classList.toggle("an-loi", !bat);
    nutLoi.classList.toggle("bat", bat);
    nutLoi.setAttribute("aria-pressed", bat ? "true" : "false");
  }
  datHienLoi(store("trangNhac.anLoi") !== "1");
  nutLoi.addEventListener("click", () => {
    const bat = body.classList.contains("an-loi");
    datHienLoi(bat);
    store("trangNhac.anLoi", bat ? null : "1");
  });

  /* ---------- Nhạc: tự phát; nếu trình duyệt chặn thì phát khi chạm mở quà ---------- */
  let daMo = false, dangChay = false, nguoiTat = false;
  const vongTien = $("vongTien"), rinTien = $("rinTien");
  function phat() {
    let p;
    try { p = nhac.play(); } catch (e) { p = Promise.reject(e); }
    return Promise.resolve(p);
  }
  function noTung() {
    if (GIAM_CHUYEN_DONG) return;
    const hop = $("hopQua").getBoundingClientRect(), cx = hop.left + hop.width / 2, cy = hop.top + hop.height / 2;
    for (let i = 0; i < 30; i++) {
      const h = el("i", "hat-no", ["♥", "✦", "♪", "✧"][i % 4]);
      h.style.left = cx + "px";
      h.style.top = cy + "px";
      h.style.fontSize = ngauNhien(12, 26) + "px";
      body.appendChild(h);
      const goc = Math.random() * Math.PI * 2, xa = ngauNhien(90, Math.max(innerWidth, innerHeight) * 0.55);
      h.animate([
        { transform: "translate(-50%,-50%) scale(.3)", opacity: 1 },
        { transform: "translate(calc(-50% + " + Math.cos(goc) * xa + "px), calc(-50% + " + (Math.sin(goc) * xa - 60) + "px)) scale(1) rotate(" + ngauNhien(-90, 90) + "deg)", opacity: 0 }
      ], { duration: ngauNhien(1100, 1900), easing: "cubic-bezier(.15,.7,.3,1)", fill: "forwards" }).finished.then(() => h.remove(), () => h.remove());
    }
  }
  function moQua() {
    if (daMo) return;
    daMo = true;
    $("qua").classList.add("mo");
    noTung();
    setTimeout(() => {
      $("qua").hidden = true;
      body.classList.remove("khoa");
    }, 1700);
    setTimeout(() => {
      body.classList.add("da-mo");
      trangThai = null;
      dangChay = true;
      batDauHien();
    }, 700);
  }
  $("qua").addEventListener("click", () => { phat().catch(() => {}); moQua(); });
  // Sau khi mở quà mà nhạc vẫn chưa chạy (trình duyệt khó tính): chạm bất kỳ đâu là phát
  ["pointerup", "touchend", "click", "keydown"].forEach((ev) => document.addEventListener(ev, () => {
    if (daMo && nhac.paused && !nguoiTat && !dangSoan && !nhac.ended) phat().catch(() => {});
  }, true));

  $("nutNhac").addEventListener("click", (e) => {
    e.stopPropagation();
    if (nhac.paused) { nguoiTat = false; phat().catch(() => {}); }
    else { nguoiTat = true; nhac.pause(); }
  });
  nhac.addEventListener("play", () => { body.classList.add("dang-phat"); giuMan(); });
  nhac.addEventListener("pause", () => body.classList.remove("dang-phat"));
  nhac.addEventListener("loadedmetadata", () => chuanBiLoi(nhac.duration));
  function capNhatTien(t) {
    const tong = nhac.duration, p = isFinite(tong) && tong > 0 ? t / tong : 0;
    vongTien.style.strokeDashoffset = (125.7 * (1 - p)).toFixed(1);
    rinTien.style.height = (p * 100).toFixed(2) + "%";
  }
  $("rinChu").textContent = "♪ " + TEN.toUpperCase() + " · " + CA_SI.toUpperCase();

  /* ---------- Giữ màn hình sáng & hiện tên bài trên màn hình khoá ---------- */
  let khoaMan = null;
  function giuMan() {
    if (!("wakeLock" in navigator) || khoaMan) return;
    navigator.wakeLock.request("screen").then((k) => {
      khoaMan = k;
      k.addEventListener("release", () => (khoaMan = null));
    }, () => {});
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !nhac.paused) giuMan(); });

  /* ---------- Cuộn tới đâu hiện tới đó, ảnh trôi nhẹ khi cuộn ---------- */
  let daBatDauHien = false, io = null;
  function batDauHien() {
    daBatDauHien = true;
    const ds = document.querySelectorAll(".hien, .chia, .lo-ra");
    if (!("IntersectionObserver" in window) || GIAM_CHUYEN_DONG) { ds.forEach((x) => x.classList.add("vao")); return; }
    io = new IntersectionObserver((muc) => {
      muc.forEach((m) => {
        if (!m.isIntersecting) return;
        m.target.classList.add("vao");
        io.unobserve(m.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    ds.forEach((x) => io.observe(x));
  }
  // phần tử vẽ thêm sau (ảnh của khách vừa tải về): chưa mở quà thì để batDauHien lo
  function theoDoi(ds) {
    if (!daBatDauHien) return;
    if (io) ds.forEach((x) => io.observe(x));
    else ds.forEach((x) => x.classList.add("vao"));
  }
  const TROI = Array.from(document.querySelectorAll("[data-troi]"));
  let canTroi = true;
  function doTroi() {
    TROI.forEach((x) => {
      const r = x.getBoundingClientRect();
      x._goc = r.top + scrollY - (x._ty || 0) + r.height / 2;
    });
  }
  function troi() {
    canTroi = false;
    const giua = scrollY + innerHeight / 2;
    TROI.forEach((x) => {
      x._ty = (giua - x._goc) * -parseFloat(x.dataset.troi);
      x.style.translate = "0 " + x._ty.toFixed(1) + "px";
    });
  }
  addEventListener("scroll", () => {
    body.classList.toggle("cuon", scrollY > 20);
    canTroi = true;
  }, { passive: true });

  /* ---------- Xem ảnh lớn ---------- */
  let dangXem = -1;
  function moXem(i) {
    dangXem = (i + ANH.length) % ANH.length;
    const a = ANH[dangXem];
    datAnh($("xaImg"), { src: a.lon || a.src, du: a.du, chuThich: a.chuThich });
    $("xaChu").textContent = pad(dangXem + 1) + " / " + (a.chuThich || "");
    $("xemAnh").hidden = false;
    body.classList.add("khoa");
  }
  function dongXem() {
    $("xemAnh").hidden = true;
    dangXem = -1;
    body.classList.remove("khoa");
  }
  $("xaDong").onclick = dongXem;
  $("xaTruoc").onclick = (e) => { e.stopPropagation(); moXem(dangXem - 1); };
  $("xaSau").onclick = (e) => { e.stopPropagation(); moXem(dangXem + 1); };
  $("xemAnh").addEventListener("click", (e) => { if (e.target === $("xemAnh")) dongXem(); });
  let vuotX = null;
  $("xemAnh").addEventListener("touchstart", (e) => { vuotX = e.touches[0].clientX; }, { passive: true });
  $("xemAnh").addEventListener("touchend", (e) => {
    if (vuotX == null) return;
    const dx = e.changedTouches[0].clientX - vuotX;
    vuotX = null;
    if (Math.abs(dx) > 50) moXem(dangXem + (dx < 0 ? 1 : -1));
  });
  document.addEventListener("keydown", (e) => {
    if (dangSoan) return phimSoan(e);
    if (dangXem >= 0) {
      if (e.key === "Escape") dongXem();
      else if (e.key === "ArrowRight") moXem(dangXem + 1);
      else if (e.key === "ArrowLeft") moXem(dangXem - 1);
      return;
    }
    if (!daMo && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); phat().catch(() => {}); moQua(); }
  });

  /* ---------- Bụi sáng bay lơ lửng ---------- */
  const cvBui = $("bui"), gBui = cvBui.getContext("2d");
  function taoTia(r, mau) {
    const c = document.createElement("canvas");
    c.width = c.height = r * 2;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, mau(1)); gr.addColorStop(0.25, mau(0.55)); gr.addColorStop(1, mau(0));
    g.fillStyle = gr;
    g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  const TIA = taoTia(32, (a) => "rgba(255,236,226," + a + ")");
  const TIA_DO = taoTia(32, (a) => "rgba(255,120,140," + a + ")");
  let BUI = [];
  function taoBui(dau) {
    const lon = Math.random() < 0.16;
    return {
      x: Math.random() * innerWidth, y: dau ? Math.random() * innerHeight : innerHeight + 40,
      r: lon ? ngauNhien(16, 38) : ngauNhien(2, 6), v: lon ? ngauNhien(4, 10) : ngauNhien(8, 24),
      a: lon ? ngauNhien(0.05, 0.12) : ngauNhien(0.2, 0.6),
      pha: Math.random() * 6.3, lac: ngauNhien(6, 28), dod: Math.random() < 0.45
    };
  }
  function datBui() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cvBui.width = Math.round(innerWidth * dpr);
    cvBui.height = Math.round(innerHeight * dpr);
    gBui.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = GIAM_CHUYEN_DONG ? 0 : Math.round(kep((innerWidth * innerHeight) / 20000, 14, 45));
    BUI = [];
    for (let i = 0; i < n; i++) BUI.push(taoBui(true));
  }
  function veBui(now, dt) {
    if (!BUI.length) return;
    gBui.clearRect(0, 0, innerWidth, innerHeight);
    gBui.globalCompositeOperation = "lighter";
    const s = now / 1000;
    for (const b of BUI) {
      b.y -= b.v * dt;
      if (b.y < -40) Object.assign(b, taoBui(false));
      gBui.globalAlpha = b.a * (0.55 + 0.45 * Math.sin(s * 1.3 + b.pha * 2));
      gBui.drawImage(b.dod ? TIA_DO : TIA, b.x + Math.sin(s * 0.4 + b.pha) * b.lac - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }
    gBui.globalAlpha = 1;
    gBui.globalCompositeOperation = "source-over";
  }

  /* ================= Trình chỉnh lời: mở bằng đuôi #soan-loi ================= */
  let dangSoan = false, soanDang = -1;
  const soan = { cau: [], ds: [], i: 0, buoc: "" };
  const PHAN_XA = 0.15; // bù độ trễ của ngón tay khi chạm (giây)

  function capNhatNhanSoan() {
    if (!CHE_DO_SOAN) return;
    const ten = { tam: "đang dùng lời tạm (chưa lưu file)", file: "lời từ file loi-bai-hat.js", lrclib: "lời tự tải (LRCLIB)" }[nguonLoi];
    $("nguonLoi").textContent = "· " + (ten || (dangTaiLoi ? "đang tải lời…" : "chưa tải được lời"));
    $("xoaLoiTam").hidden = nguonLoi !== "tam";
  }
  function dinhDang(t) {
    const cs = Math.round(Math.max(0, t) * 100), m = Math.floor(cs / 6000), s = (cs % 6000) / 100;
    return pad(m) + ":" + (s < 10 ? "0" : "") + s.toFixed(2);
  }
  function xuatLrc(ds, dau) {
    const dong = ds.slice().sort((a, b) => a.t - b.t).map((d) => "[" + dinhDang(d.t) + "]" + d.text);
    return (dau ? "[ti:" + TEN + "]\n[ar:" + CA_SI + "]\n" : "") + dong.join("\n");
  }
  const baoSoan = (t) => ($("soanBao").textContent = t);
  const luuTam = () => store(KHOA_LOI, xuatLrc(soan.ds, true));
  function doiBuoc(b) {
    soan.buoc = b;
    $("soanNhap").hidden = b !== "nhap";
    $("soanCanh").hidden = b !== "canh";
    $("soanSua").hidden = b !== "sua";
    $("soan").scrollTop = 0;
  }
  function moSoan() {
    dangSoan = true;
    body.classList.add("dang-soan", "khoa");
    $("qua").hidden = true;
    $("soan").hidden = false;
    if (LOI.length) $("soanChu").value = xuatLrc(LOI, false);
    doiBuoc("nhap");
  }
  function veTrang() {
    nhac.pause();
    history.replaceState(null, "", location.pathname + location.search);
    location.reload();
  }
  function batDauCanh() {
    const cau = $("soanChu").value.split(/\r?\n/).map((s) => s.replace(/\[[^\]]*\]/g, "").trim()).filter(Boolean);
    if (!cau.length) { $("soanNhapBao").textContent = "Hãy dán lời bài hát vào ô trên trước nhé."; $("soanChu").focus(); return; }
    soan.cau = cau;
    soan.ds = [];
    soan.i = 0;
    doiBuoc("canh");
    veCanh();
    nhac.currentTime = 0;
    phat().catch(() => {});
  }
  function veCanh() {
    const n = soan.cau.length, i = soan.i, truoc = soan.ds[soan.ds.length - 1];
    $("sTruoc").textContent = truoc ? "✓ " + (truoc.text || "♪ nhạc không lời") : "";
    $("sToi").textContent = i < n ? soan.cau[i] : "Đã canh xong toàn bộ lời 🎉 Bấm “Xong → kiểm tra”.";
    $("sSau").textContent = i + 1 < n ? soan.cau[i + 1] : "";
    $("sDem").textContent = "Câu " + Math.min(i + 1, n) + " / " + n;
    $("soanBam").disabled = i >= n;
  }
  function bamCau() {
    if (soan.i >= soan.cau.length) return;
    soan.ds.push({ t: Math.max(0, nhac.currentTime - PHAN_XA), text: soan.cau[soan.i++] });
    $("soanBam").animate([{ transform: "scale(.97)", filter: "brightness(1.3)" }, { transform: "none", filter: "none" }], { duration: 280 });
    veCanh();
  }
  function bamNghi() {
    soan.ds.push({ t: Math.max(0, nhac.currentTime - PHAN_XA), text: "" });
    veCanh();
  }
  function bamLui() {
    const d = soan.ds.pop();
    if (!d) return;
    if (d.text) soan.i--;
    nhac.currentTime = Math.max(0, d.t - 3);
    veCanh();
  }
  function moSua(ds) {
    nhac.pause();
    soan.ds = ds.slice().sort((a, b) => a.t - b.t);
    luuTam();
    doiBuoc("sua");
    veDs();
    baoSoan("Đã lưu tạm trong trình duyệt này. Muốn giữ hẳn: bấm “Tải file loi-bai-hat.js” rồi chép đè vào thư mục trang.");
  }
  function veDs() {
    const ol = $("soanDs");
    ol.textContent = "";
    soanDang = -1;
    soan.ds.forEach((d) => {
      const li = el("li", d.text ? "" : "nghi");
      const nghe = el("button", "s-o", "▶"), tru = el("button", "s-o", "−"), cong = el("button", "s-o", "+"), xoa = el("button", "s-o xoa", "✕");
      [nghe, tru, cong, xoa].forEach((b) => (b.type = "button"));
      nghe.title = "Nghe từ câu này";
      xoa.title = "Xoá dòng này";
      const o = el("input", "s-gio");
      o.value = dinhDang(d.t);
      o.inputMode = "decimal";
      const chinh = (dt) => { d.t = Math.max(0, Math.round((d.t + dt) * 100) / 100); o.value = dinhDang(d.t); luuTam(); };
      nghe.onclick = () => { nhac.currentTime = Math.max(0, d.t - 1.5); phat().catch(() => {}); };
      tru.onclick = () => chinh(-0.1);
      cong.onclick = () => chinh(0.1);
      o.onchange = () => {
        const m = /^(\d+):(\d+(?:[.,]\d+)?)$/.exec(o.value.trim());
        if (m) { d.t = +m[1] * 60 + parseFloat(m[2].replace(",", ".")); luuTam(); }
        o.value = dinhDang(d.t);
      };
      xoa.onclick = () => { soan.ds.splice(soan.ds.indexOf(d), 1); luuTam(); veDs(); };
      li.append(nghe, o, tru, cong, el("span", "s-chu", d.text || "♪ nhạc không lời (ẩn lời)"), xoa);
      ol.appendChild(li);
    });
  }
  function capNhatSoan() {
    const t = nhac.currentTime;
    if (soan.buoc === "canh") $("sGio").textContent = phutGiay(t) + " / " + phutGiay(nhac.duration);
    if (soan.buoc !== "sua") return;
    let k = -1, gan = -1;
    soan.ds.forEach((d, i) => { if (d.t <= t + 0.05 && d.t >= gan) { gan = d.t; k = i; } });
    if (k !== soanDang) {
      const li = $("soanDs").children;
      if (li[soanDang]) li[soanDang].classList.remove("dang");
      if (li[k]) li[k].classList.add("dang");
      soanDang = k;
      $("sXem").textContent = k >= 0 ? soan.ds[k].text || "♪" : "—";
    }
    $("sXemGio").textContent = phutGiay(t);
  }
  function phimSoan(e) {
    if (soan.buoc !== "canh") return;
    if (e.code === "Space" || e.key === " ") { e.preventDefault(); bamCau(); }
    else if (e.key === "n" || e.key === "N") { e.preventDefault(); bamNghi(); }
    else if (e.key === "Backspace") { e.preventDefault(); bamLui(); }
    else if (e.key === "Escape") moSua(soan.ds);
  }
  function noiDungFile() {
    const lrc = xuatLrc(soan.ds, true).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    return "/* Lời bài hát có mốc thời gian (định dạng LRC), lưu bằng trình chỉnh lời ngày " + new Date().toLocaleDateString("vi-VN") + ".\n" +
      "   Muốn sửa: bấm \"✎ Chỉnh lời\" ở chân trang, hoặc sửa thẳng các dòng [phút:giây.xx] bên dưới.\n" +
      "   Xoá hết lời (để trống giữa hai dấu ` `) thì trang quay lại tự tải lời. */\n" +
      "window.LOI_BAI_HAT = `\n" + lrc + "\n`;\n";
  }
  function chepCu(t, xong) {
    const o = el("textarea");
    o.value = t;
    document.body.appendChild(o);
    o.select();
    try { document.execCommand("copy"); xong(); } catch (e) { /* bỏ qua */ }
    o.remove();
  }

  $("soanDong").onclick = veTrang;
  $("soanBatDau").onclick = batDauCanh;
  $("soanGiuMoc").onclick = () => {
    const ds = docLrc($("soanChu").value);
    if (!ds.length) { $("soanNhapBao").textContent = "Chưa thấy mốc thời gian dạng [00:12.34] trong ô trên (lời có thể đang tải, chờ vài giây rồi thử lại)."; return; }
    moSua(ds);
  };
  // pointerdown thay vì click để mốc thời gian chính xác ngay lúc ngón tay chạm xuống
  $("soanBam").addEventListener("pointerdown", (e) => { e.preventDefault(); bamCau(); });
  $("soanBam").addEventListener("click", (e) => { if (e.detail === 0) bamCau(); });
  $("soanNghi").onclick = (e) => { e.currentTarget.blur(); bamNghi(); };
  $("soanLui").onclick = (e) => { e.currentTarget.blur(); bamLui(); };
  $("soanXong").onclick = () => moSua(soan.ds);
  $("soanNgheDau").onclick = () => { nhac.currentTime = 0; phat().catch(() => {}); };
  $("soanTam").onclick = () => nhac.pause();
  document.querySelectorAll("[data-lech]").forEach((b) => (b.onclick = () => {
    const dt = +b.dataset.lech;
    soan.ds.forEach((d) => (d.t = Math.max(0, Math.round((d.t + dt) * 100) / 100)));
    luuTam();
    veDs();
  }));
  $("soanLai").onclick = () => {
    nhac.pause();
    $("soanChu").value = xuatLrc(soan.ds, false);
    doiBuoc("nhap");
  };
  $("soanXem").onclick = () => { luuTam(); veTrang(); };
  $("soanTai").onclick = () => {
    const url = URL.createObjectURL(new Blob([noiDungFile()], { type: "text/javascript;charset=utf-8" }));
    const a = el("a");
    a.href = url;
    a.download = "loi-bai-hat.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    baoSoan("Đã tải file loi-bai-hat.js (thường nằm trong thư mục Downloads). Chép file đó đè lên file loi-bai-hat.js trong thư mục trang là xong.");
  };
  $("soanChep").onclick = () => {
    const lrc = xuatLrc(soan.ds, true);
    const xong = () => baoSoan("Đã sao chép. Mở loi-bai-hat.js bằng Notepad, dán vào giữa hai dấu ` ` rồi Lưu (Ctrl+S).");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(lrc).then(xong, () => chepCu(lrc, xong));
    else chepCu(lrc, xong);
  };
  $("xoaLoiTam").onclick = () => { store(KHOA_LOI, null); location.reload(); };
  addEventListener("hashchange", () => { if (location.hash === "#soan-loi") location.reload(); });

  /* ---------- Vòng lặp chính ---------- */
  let truocDo = performance.now();
  function vong(now) {
    requestAnimationFrame(vong);
    const dt = Math.min(0.1, Math.max(0, (now - truocDo) / 1000));
    truocDo = now;
    if (!document.hidden) veBui(now, dt);
    if (dangSoan) return capNhatSoan();
    if (canTroi && !GIAM_CHUYEN_DONG) troi();
    if (!dangChay) return;
    const t = nhac.currentTime;
    capNhatLoi(t);
    capNhatTien(t);
  }

  let henCo = 0;
  addEventListener("resize", () => {
    clearTimeout(henCo);
    henCo = setTimeout(() => { datBui(); doTroi(); canTroi = true; }, 150);
  });
  addEventListener("load", () => { doTroi(); canTroi = true; });

  /* ---------- Khởi động ---------- */
  datBui();
  doTroi();
  nhac.src = D.nhac || "";
  if (CHE_DO_SOAN) $("moSoan").hidden = false;
  taiLoi();
  const anhSan = batDauAnh();
  if (location.hash === "#soan-loi") {
    moSoan();
  } else {
    body.classList.add("khoa");
    // thử tự phát nhạc ngay khi mở trang: trình duyệt cho phép thì hộp quà tự mở (đợi ảnh tải xong, tối đa 4 giây)
    phat().then(() => Promise.race([anhSan, cho(4000)]).then(() => setTimeout(moQua, 600)), () => {});
  }
  requestAnimationFrame(vong);
})();
