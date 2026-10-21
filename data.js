/* =====================================================================
   NỘI DUNG TRANG — chỉ cần sửa file này.
   Quy tắc nhỏ:
     • Chữ đặt trong dấu ngoặc kép "..."
     • Mỗi mục trong danh sách [ ... ] cách nhau bằng dấu phẩy ,
     • Dòng bắt đầu bằng // là ghi chú, trang web sẽ bỏ qua.
     • Trong các dòng tiêu đề, chữ đặt giữa hai dấu * sẽ hiện bằng font viết tay UTM Zirkon màu hồng,
       ví dụ "*theo cách*".
   ===================================================================== */

window.TRANG = {
  // Tên idol: hiện ở logo góc trên và tiêu đề lời nhắn. Để "" thì hiện tên bài hát.
  tenIdol: "",

  tenBai: "Giờ Thì",
  caSi: "buitruonglinh", 
  nhac: "nhac/gio-thi.mp3",

  /* ---------- Khách tự tải ảnh lên (xem HUONG-DAN.txt mục 6) ----------
     apiAnh: link Apps Script của kho ảnh (dạng https://script.google.com/macros/s/..../exec).
             Để "" thì trang chỉ dùng các ảnh trong thư mục anh như bình thường.
     maTrang: tên riêng của trang này trong kho ảnh — chữ không dấu, số, dấu gạch ngang.
             MỖI KHÁCH MỘT MÃ KHÁC NHAU, và phải trùng với cột "Mã trang" trong Google Sheet.
     Khách vào trang quan-ly.html, nhập mã quản lý để thêm / xoá / sắp xếp ảnh.
     Khi khách đã có ảnh tải lên, trang dùng ảnh của khách thay cho các ảnh mẫu ở cuối file này. */
  apiAnh: "https://script.google.com/macros/s/AKfycbwvdT9FokII-96ZJUcDT1uDLpHsP25pfD8p4AMQD8J3MAdlQn_XRUqgazPDd0v1Zqaybg/exec",
  maTrang: "gio-thi-01",

  /* Lời bài hát TỰ TẢI theo nhạc từ kho lời LRCLIB (lrclib.net).
     Số 18142455 là bản lời đã được kiểm tra khớp thời gian với file nhạc gio-thi.mp3. */
  loiTuDong: { id: 18142455 },
  // Lời hiện sớm/muộn so với giọng hát thì chỉnh ở đây (giây): 0.3 = muộn hơn 0,3 giây, -0.3 = sớm hơn.
  lechLoi: 0,

  /* ---------- Màn hộp quà mở đầu ---------- */
  qua: {
    nhan: "MỘT MÓN QUÀ NHỎ DÀNH CHO BẠN",
    goiY: "CHẠM ĐỂ MỞ"
  },

  /* ---------- Phần đầu trang ---------- */
  dau: {
    nhan: "MỘT GÓC NHỎ ĐỂ NHỚ",
    tieuDe: ["Rực rỡ", "*theo cách*", "rất riêng."],
    moTa: "Một góc nhỏ lưu lại những sân khấu rực đỏ, những bộ ảnh thật ngầu và cả những khoảnh khắc đáng yêu ngoài ánh đèn."
  },

  /* ---------- 01 — Câu chuyện ---------- */
  cauChuyen: {
    nhan: "01 — CÂU CHUYỆN",
    tieuDe: ["Một sân khấu.", "*Ngàn kỷ niệm.*"],
    moTa: "Ánh đèn, tiếng hò reo, bộ trang phục lấp lánh và nụ cười sau cánh gà — từng chút một gói lại thành một hành trình thật đặc biệt."
  },

  khoanhKhac: {
    nhan: "KHOẢNH KHẮC ĐÁNG NHỚ",
    tieuDe: ["Từ khoảnh khắc này", "*đến khoảnh khắc khác.*"],
    moTa: "Mỗi bức ảnh là một mảnh ghép nhỏ: lúc cháy hết mình trên sân khấu, lúc tinh nghịch với chiếc mũ tai thỏ, lúc lặng yên trong một chiều đông.",
    nut: "XEM KỶ NIỆM →"
  },

  /* ---------- 02 — Kỷ niệm (bộ sưu tập ảnh) ---------- */
  kyNiem: {
    nhan: "02 — KỶ NIỆM",
    tieuDe: ["Những mảnh ghép", "*nhỏ của mãi mãi.*"],
    moTa: "Chạm vào ảnh để xem lớn hơn."
  },

  cuonPhim: "CUỘN PHIM KỶ NIỆM",

  /* ---------- 03 — Lời nhắn ---------- */
  loiNhan: {
    nhan: "03 — LỜI NHẮN",
    tieuDe: ["Gửi thần tượng,", "*bằng cả trái tim.*"],
    doan: [
      "Có những bài hát nghe một lần là nhớ mãi, có những nụ cười nhìn một lần là thấy lòng nhẹ hẳn đi.",
      "Cảm ơn vì đã luôn cháy hết mình trên sân khấu, và vì cả những khoảnh khắc đời thường đáng yêu ngoài ánh đèn.",
      "Dù đi xa đến đâu, mong rằng góc nhỏ này luôn nhắc bạn rằng vẫn có người đang dõi theo và cổ vũ."
    ],
    kyTen: "— một người hâm mộ nhỏ ♡"
  },

  /* ---------- Cuối trang ---------- */
  cuoi: {
    nhan: "CHO ĐẾN KHOẢNH KHẮC SAU",
    tieuDe: ["Hẹn gặp lại", "*lần sau nhé.*"],
    nut: "↑ VỀ ĐẦU TRANG"
  },

  /* Ảnh idol MẪU (dùng khi khách chưa tải ảnh lên). Thứ tự dùng trên trang:
       ảnh 1 + 4: phần đầu trang · ảnh 2 + 3: phần "Khoảnh khắc đáng nhớ"
       ảnh 8: nền lời nhắn · ảnh 5: ảnh tròn cuối trang
       tất cả ảnh: bộ sưu tập "Kỷ niệm" và cuộn phim.
     chuThich: chú thích dưới ảnh trong bộ sưu tập.
     viTri: chỗ giữ lại khi ảnh bị cắt cho vừa khung, "50% 20%" = giữ phần trên (mặt). */
  anh: [
    { src: "anh/01.jpg", chuThich: "Ánh đèn đỏ", viTri: "50% 22%" },
    { src: "anh/02.jpg", chuThich: "Dang tay ôm cả sân khấu", viTri: "50% 25%" },
    { src: "anh/03.jpg", chuThich: "Đêm nhận dải băng", viTri: "50% 20%" },
    { src: "anh/04.jpg", chuThich: "Mũ tai thỏ", viTri: "50% 30%" },
    { src: "anh/05.jpg", chuThich: "Denim & nắng nhẹ", viTri: "50% 18%" },
    { src: "anh/06.jpg", chuThich: "Đen, da và nhạc rock", viTri: "50% 15%" },
    { src: "anh/07.jpg", chuThich: "Mái tóc vàng", viTri: "50% 25%" },
    { src: "anh/08.jpg", chuThich: "Áo khoác lông", viTri: "50% 25%" },
    { src: "anh/09.jpg", chuThich: "Trắng & đen", viTri: "50% 20%" },
    { src: "anh/10.jpg", chuThich: "Trái tim nhỏ", viTri: "50% 22%" },
    { src: "anh/11.jpg", chuThich: "Bản violin", viTri: "50% 30%" },
    { src: "anh/12.jpg", chuThich: "Chiếc áo len xanh", viTri: "50% 35%" }
  ]
};
