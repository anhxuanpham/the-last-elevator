/* THE LAST ELEVATOR: FLOOR 13 — standalone browser game */
(function(){
  'use strict';
  var SAVE_KEY='tle_floor13_save_v1', BEST_KEY='tle_floor13_best_v1', SOUND_KEY='tle_floor13_sound';
  var $=function(s){return document.querySelector(s)};
  var $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  var escapeHTML=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var people={
    mai:{name:'NGUYỄN MAI',unit:'803',floor:8,role:'Cư dân · Nhân viên văn phòng',skin:'#c99b7b',hair:'#292121',coat:'#aa987d',gender:'woman'},
    huy:{name:'TRẦN QUỐC HUY',unit:'Khách',floor:11,role:'Shipper · Giao hàng',skin:'#bc805e',hair:'#1e1d1b',coat:'#ae763d',gender:'man'},
    bay:{name:'ÔNG BẢY',unit:'Cựu bảo vệ',floor:3,role:'Bảo vệ ca đêm (đã nghỉ)',skin:'#b3a08c',hair:'#a8abb0',coat:'#465f58',gender:'man'},
    minh:{name:'LÊ HOÀNG MINH',unit:'602',floor:6,role:'Kỹ thuật viên IT',skin:'#ae8469',hair:'#171d24',coat:'#4b6572',gender:'man'},
    an:{name:'BÉ AN',unit:'Chưa xác định',floor:9,role:'Trẻ em · Không có người đi cùng',skin:'#cfac8f',hair:'#1c171d',coat:'#a34f51',gender:'child'},
    hanh:{name:'BÀ HẠNH',unit:'Quản lý',floor:12,role:'Ban quản lý tòa nhà',skin:'#c79a79',hair:'#2e2528',coat:'#624a5a',gender:'woman'},
    stranger:{name:'NGƯỜI LẠ',unit:'Không rõ',floor:13,role:'Không có hồ sơ',skin:'#b0b3aa',hair:'#080d10',coat:'#252f39',gender:'faceless'},
    linh:{name:'NGƯỜI TRỰC CŨ',unit:'Phòng bảo vệ',floor:0,role:'Nhân viên trực ca đêm',skin:'#bb997d',hair:'#2b292a',coat:'#44575a',gender:'woman'}
  };
  var residents=[
    ['Nguyễn Mai','803','Đang cư trú'],['Lê Hoàng Minh','602','Đang cư trú'],
    ['Hoàng Thu Hạnh','Văn phòng BQL','Quản lý'],['Trần Quốc Huy','Khách giao hàng','Phải được xác nhận'],
    ['Bé An','Không tìm thấy','—'],['Ông Bảy','Nhân viên cũ','Nghỉ từ 2013']
  ];
  // Keys: c = camera, r = registry, l = elevator log. Each case offers 2 investigations.
  var cases=[
    {id:1,night:1,person:'mai',floor:8,quote:'Cho tôi lên 803 nhé. Tôi ôm cái chậu này từ công ty về, mỏi cả tay rồi.',note:'Lá cây nhỏ giọt xuống đôi giày. Cô giữ cửa bằng khuỷu tay để khỏi làm gãy một nhánh.',safe:true,
     r:'Nguyễn Mai · căn 803. Ảnh thẻ được cập nhật tháng trước. Số nội bộ và chữ ký nhận thư sáng nay trùng hồ sơ.',
     c:'01:08. Mai đi từ cửa chính vào, tay ôm chậu cây có buộc sợi vải xanh. Bóng cô đi qua kính cùng lúc với người. Không có lượt vào nào khác.',
     l:'Thẻ 803 rời tầng 8 lúc 18:42. 01:08, thẻ trở lại đầu đọc sảnh và yêu cầu lên tầng 8. Chuỗi giờ không có lượt trùng.',
     outcome:'Mai vào thang, nâng chậu cây cho bạn nhìn: “Sáng mai nhìn cửa sổ thứ ba nhé. Tôi để nó ở đó.” Cô phải đặt chậu xuống mới bấm được nút giữ cửa cho mình.',
     wrong:'Mai nhìn chậu cây rồi nhìn cầu thang. “Tám tầng thôi mà.” Cô đi chậm, dừng ở mỗi chiếu nghỉ để đổi tay. Đến lúc tiếng bước chân mất hẳn, dưới quầy vẫn còn một chiếc lá.'},
    {id:2,night:1,person:'huy',floor:11,quote:'Đơn 1102, chị ơi. Cho em sạc nhờ một phút được không? Em phải chờ khách nhận rồi mới về.',note:'Màn hình điện thoại còn 2%. Ngón tay anh giữ chặt mép túi giấy đang mềm vì mưa.',safe:true,
     r:'Đơn D-719 · quán Bếp Khuya · căn 1102. Cuộc gọi từ số 1102 lưu trong sổ xác nhận đúng tên quán và tiền hàng lúc 01:09.',
     c:'Camera cửa và bãi xe ghi cùng chiếc mũ có vết xước. Huy lấy túi niêm phong từ cốp; nhãn D-719 nằm dưới một vệt dầu nhỏ.',
     l:'1102 vừa tạo yêu cầu nhận D-719. Chưa có xác nhận giao xong. Mã đơn chỉ dùng trong ca hiện tại.',
     outcome:'Huy lên tầng 11. Gần một phút sau, 1102 xác nhận đã nhận đồ. Anh quay xuống lấy điện thoại: “Cảm ơn chị đã đợi.” Dây sạc còn ấm trong tay bạn.',
     wrong:'Huy gọi khách ngay dưới camera rồi mang hàng về quán. D-719 chuyển thành giao thất bại. Điện thoại tắt trước khi anh kịp rút dây sạc.'},
    {id:3,night:1,person:'bay',floor:3,quote:'Tủ điện tầng ba. Cái công tắc có sợi chỉ đỏ ấy... cô còn để nó chứ?',note:'Ông vuốt một chiếc chìa khóa đã mòn. Khi loa rè, bàn tay ông thôi run.',safe:true,evidenceKey:'l',
     r:'Ông Bảy. Sổ bảo trì tầng 3 còn dấu nhận chìa khóa của ông. Dòng nhân sự dừng ở năm 2013; trang kế tiếp bị dính nước.',
     c:'Ảnh bàn giao 2013: Bảy buộc chỉ đỏ vào cầu dao nhỏ bên phải. Người trước mặt chỉ đúng vị trí ấy dù nắp tủ đang đóng.',
     l:'Sơ đồ sau nắp tủ: ngắt nguồn chính để dừng động cơ; giữ nguồn phụ cho đèn và chốt cửa cứu hộ. Một sợi chỉ đỏ nằm dưới chữ PHỤ. Dưới sơ đồ có mười vạch bút chì.',
     outcome:'Ông Bảy bước vào, chùm chìa khóa vẫn ở tay. “Nó hỏi tôi cô có còn trực không.” Bạn chưa kịp hỏi ai thì cửa đóng. Từ loa có ba tiếng gõ rất nhỏ.',
     wrong:'Bảy mang chùm chìa khóa về phía cầu thang. Ông không để lại chìa khóa trên quầy. Trước khi đi, ông tháo mũ: “Nếu nghe tiếng đếm, đừng trả lời hộ tôi.”'},
    {id:4,night:1,person:'minh',floor:6,quote:'Minh, IT căn 602. Thẻ em đây. Chị mở trước đi, phiếu sửa em gửi sau.',note:'Anh đưa thẻ qua khe kính. Khi bạn lật thẻ, anh vẫn nhìn đúng chỗ tấm ảnh vừa nằm.',safe:false,evidenceKey:'l',spooky:true,
     r:'Lê Hoàng Minh · 602. Số thẻ và chân dung khớp hồ sơ. Phiếu sửa gần nhất đã đóng; chưa có phiếu mới cho ca này.',
     c:'Camera sảnh ghi anh chớp mắt ở giây 11. Đến giây 14, vệt mưa sau lưng đã đổi nhưng mắt và ngón tay trên thẻ giữ nguyên từng điểm.',
     l:'01:02, thẻ Minh lên tầng 6. Nội bộ 602 vừa trả lời từ phòng: “Tôi đang ở nhà.” 01:11, cùng mã thẻ yêu cầu một lượt từ sảnh. Chưa có chuyến xuống giữa hai mốc.',
     outcome:'Bạn giữ khóa. Người kia cất thẻ, nhưng tấm ảnh vẫn còn trên kính thêm một nhịp. Loa phát tiếng nhấp chuột, giống hệt tiếng bạn vừa bấm.',
     wrong:'Người kia vào cabin, không mang theo thẻ vừa đưa bạn. Đầu đọc báo thêm một phiên không có mã chủ. Khi bạn nhìn xuống, trên tay chẳng có tấm thẻ nào.'},
    {id:5,night:2,person:'minh',floor:6,quote:'Hôm nay có phiếu thật. Chị gọi 602 trước cũng được. Nhưng đừng thử cái công tắc nhỏ bằng cách tắt nó nhé.',note:'Túi dụng cụ đặt dưới chân. Một tờ phiếu còn dính ghim vào tay áo, chưa bị xé khỏi cuống.',safe:true,evidenceKey:'l',
     r:'Phiếu IT-206 được lễ tân lập lúc 00:50 đêm thứ hai. Nội bộ 602 xác nhận lịch kiểm tra rơ-le và lưu âm. Số cuống trên tay Minh khớp bản lễ tân.',
     c:'Minh đi từ bãi xe qua hai camera. Anh dừng nhặt con vít rơi khỏi túi, rồi quay lại đóng cốp. Dấu thời gian hai góc khớp nhau.',
     l:'Hai lượt thẻ Minh đêm đầu; lượt ở sảnh đã bị từ chối. Bộ lưu 2013 có một khoảng âm thanh dài 11 giây bị tách khỏi bản báo cáo. Rơ-le từng giữ cabin ở chiếu nghỉ bảo trì 13. Dòng điện phụ không cấp cho động cơ.',
     outcome:'Minh gửi bản chẩn đoán rồi tháo chiếc rơ-le cháy cạnh. “Máy này không tự đánh giá cabin trống, chị ạ. Phải có người xác nhận.” Anh đặt tai nghe lên quầy, không bật nó.',
     wrong:'Minh rời sảnh, không trao bản chẩn đoán. Tai nghe theo anh về bãi xe. “Phiếu cũ vẫn trong máy. Đừng tin cái tiêu đề.” Túi dụng cụ chạm chân anh từng nhịp.'},
    {id:6,night:2,person:'an',floor:9,quote:'Cho cháu về tầng chín với mẹ. Cháu giữ chỗ cho cô rồi. Cô đừng bảo cháu đếm nữa nhé.',note:'Tai phải con gấu được khâu bằng chỉ đỏ. Bé chừa một khoảng trống cạnh mình, như sợ ai không có chỗ đứng.',safe:true,evidenceKey:'r',
     r:'An · 7 tuổi · căn 904 cùng mẹ là Vân. Phụ lục cứu hộ 2013 ghi cả hai trong cabin số 1. Báo cáo sau cùng bỏ hai dòng ấy; ô xác nhận trở về để trống.',
     c:'Băng 2013: Vân ngồi xuống khâu tai gấu cho An trước cửa 904. Bé hiện tại kéo đúng mũi chỉ bị thừa, rồi che bàn tay đang đếm sau lưng.',
     l:'Cuộc gọi 904 dừng lúc 01:13 năm 2013. Cabin kẹt trên chiếu nghỉ bảo trì; tầng 9 là nơi hai mẹ con đi vào. Chưa có lượt trở về 904 trong bản cứu hộ.',
     outcome:'An bước vào cabin, quay con gấu để nó nhìn bạn. “Cô cũng đừng đi đâu. Lần này cháu nhìn thấy cô rồi.” Cửa khép; bàn tay bé vẫn giữ khoảng trống cạnh mình.',
     wrong:'An lùi về phía cầu thang cũ. Bé ngồi ở chiếu nghỉ tầng 9, đặt gấu lên đầu gối. “Vậy cháu chờ thêm.” Lần này bé không giơ ngón tay để đếm.'},
    {id:7,night:2,person:'stranger',floor:13,quote:'Còn một chỗ. Những người kia đều có tên để về. Viết cho tôi một cái được không?',note:'Tấm thẻ trắng được đẩy sát ô ký tên của người trực. Phía trong áo khoác khô ráo, dù nước chảy khỏi cổ tay.',safe:false,evidenceKey:'c',spooky:true,
     r:'Không có địa chỉ hoặc người đón tương ứng. Ô được đề nghị điền không thuộc danh sách hành khách: đó là dòng cấp thẻ nhân viên mới, cần chữ ký người đang trực.',
     c:'Ống kính lấy nét được đường chỉ trên cổ áo, không lấy được vùng mặt. Khi người kia nhích thẻ, con trỏ ở ô tên LINH trên máy trực cũng nhích theo.',
     l:'Mã 13 nằm ngoài sơ đồ 12 tầng dân dụng: đó là chiếu nghỉ bảo trì. Bản yêu cầu hiện tại không mở lối về căn hộ; nó xin thêm quyền ký và đổi tên người trực.',
     outcome:'Bạn đẩy thẻ lại. Người kia không nhặt. Từ phần cổ áo tối om vang lên: “Mỏi cả tay rồi.” Đó là giọng Mai, nhưng không có tiếng mưa hay tiếng lá.',
     wrong:'Cửa mở. Áo khoác đi lên, còn nước trên sàn chảy về phía bàn trực. Một phiên không tên vừa nhận quyền nội bộ; ô chữ ký của bạn hiện thêm nét bút đầu tiên.'},
    {id:8,night:2,person:'hanh',floor:12,quote:'Hạnh đây. Đưa chị lên văn phòng. Bản ghi cũ sai rồi, xóa giúp chị trước lúc người ta đến nhận máy.',note:'Bà đặt một tập giấy lên quầy. Trang ký nằm trên cùng; những trang trước vẫn còn đóng ghim.',safe:false,evidenceKey:'l',spooky:true,
     r:'Lịch công tác: Hạnh không ở tòa nhà đêm nay. Cuộc gọi lại bằng số công vụ lưu trong sổ xác nhận bà đang ở sân bay. Chưa có lệnh hủy dữ liệu.',
     c:'Cửa cabin mở ra rồi người mang mặt Hạnh mới xuất hiện. Bà lật giấy ba lần; tiếng giấy trong loa luôn đến trước động tác một nhịp.',
     l:'Yêu cầu xóa dùng mẫu lệnh 2013, cùng số biên bản cabin trống. Nguồn cấp là đường intercom, không phải tài khoản quản lý. Phụ lục tên và khoảng băng 11 giây sẽ bị xóa cùng lúc.',
     outcome:'Bạn giữ nguyên dữ liệu. Bà khép tập giấy: “Cô ký một lần rồi mà.” Trong khe giữa hai trang, chữ LINH hằn ngược lên tờ giấy trắng.',
     wrong:'Người mang mặt Hạnh đi vào. Máy bắt đầu đếm lùi để ghi đè; bản gốc vẫn nằm trong vùng chỉ đọc. Ở ô đồng ý xóa, nét chữ hiện ra giống chữ bạn hơn nét chữ bà.'},
    {id:9,night:3,person:'huy',floor:11,quote:'Đơn từ đêm đầu vẫn chưa giao được. Mã D-719, chị nhớ chứ? Em chờ họ nhận rồi mới về.',note:'Điện thoại không sáng màn hình. Dây sạc được gấp thành đúng ba vòng như lúc bạn trả lại; anh không mở máy để kiểm tra mã đơn.',safe:false,evidenceKey:'l',spooky:true,
     r:'D-719 đã hoàn tất đêm đầu. 1102 xác nhận không đặt lại; mã hết hạn. Yêu cầu mới đến từ máy nội bộ đã bị tháo sau sự cố 2013.',
     c:'Vết dầu trên túi nằm đúng chỗ cũ, nhưng chữ tên quán bị in ngược. Miệng anh ngừng cử động ở từ “về”; âm cuối vẫn chạy thêm một vòng.',
     l:'1102 đã nhận đồ ở đêm đầu. Không có đơn mới. Gói âm thanh gửi kèm chứa tiếng khách nhận hàng và một lệnh ở bàn trực — không có tiếng động ngoài phố.',
     outcome:'Bạn giữ khóa. Huy cúi nhìn điện thoại tắt: “Nếu không có người nhận, em phải chờ bao lâu?” Giọng hỏi là của một đứa trẻ. Giọng trả lời từ loa là của bạn.',
     wrong:'Người kia vào thang. Nội bộ 1102 đổ chuông nhưng không ai gọi từ cabin. Trên loa, giọng bạn bắt đầu hướng dẫn một người khác ngồi vào bàn trực.'},
    {id:10,night:3,person:'mai',floor:8,quote:'Cho tôi lên 803 nhé. Tôi ôm cái chậu này từ công ty về, mỏi cả tay rồi.',note:'Chậu cây vẫn bọc trong túi giấy. Mép túi rách đúng chỗ đêm đầu; sợi vải xanh chưa bị cắt.',safe:false,evidenceKey:'c',spooky:true,
     r:'Mai đang ở 803. Cuộc gọi hình từ số lưu trong sổ cho thấy chậu cây ở cửa sổ thứ ba. Cô hỏi tại sao máy lại gọi đúng câu mình nói đêm đầu.',
     c:'Khung người dưới sảnh trùng bản đêm đầu, tới cả một giọt nước. Camera cửa chính không ghi lượt vào hiện tại. Trên hình sống từ 803, Mai đang cắt sợi vải xanh khỏi chậu.',
     l:'Đêm đầu có một lượt lên tầng 8 sau khi Mai được cho vào. Lượt đang xin dùng lại cùng dấu thời gian và mã, không có lần quẹt mới.',
     outcome:'Mai dưới sảnh giữ nguyên tư thế dù hình đã tắt. Điện thoại bàn vang lên, Mai thật hỏi: “Linh, cô còn ở đó không?” Bạn nhận ra mình đã từng nghe một người khác hỏi câu ấy.',
     wrong:'Cửa mở cho khoảng trống giữa hai cánh tay. Ở đầu dây, Mai thật nói cô vẫn đang trên tầng 8. Câu xin lên nhà tiếp tục phát, mỗi lần gần giọng bạn thêm một chút.'},
    {id:11,night:3,person:'bay',floor:3,quote:'Tôi bảo cô tắt điện, rồi chạy vào mà không chỉ đúng cầu dao. Lần này tôi giữ cửa. Cô giữ nguồn phụ giúp tôi.',note:'Ông cởi sợi chỉ đỏ khỏi cổ tay, quấn lại quanh chiếc chìa khóa. Ông không nhìn tránh bạn nữa.',safe:true,evidenceKey:'l',
     r:'Phụ lục cứu hộ: Bảy · An · Vân, chưa xác nhận trở về. Dòng LINH nằm dưới mục NGƯỜI LẬP BIÊN BẢN, khác ba dòng phía trên. Mép giấy còn dấu một chiếc ghim đã tháo.',
     c:'Băng gốc: Bảy luồn người vào cabin, giữ cánh cửa cho Vân kéo An lên. Khung sau mất sáng. Người trước mặt đặt tay lên đúng vết lõm của cửa cứu hộ, không tới gần ô cấp thẻ.',
     l:'Hướng dẫn dưới nắp bàn trực: ngắt nguồn chính; giữ nguồn phụ; kéo cần mở cửa thủ công. Chìa khóa mở tủ tầng 3, còn cần cứu hộ vẫn dùng được nếu mất chìa. Bản bàn giao phải giữ cả phụ lục lẫn lời khai gốc.',
     outcome:'Bảy trao chìa khóa trước khi vào thang. “Tôi nghe con bé. Cô cũng nghe.” Ông không nói thêm để bạn có thể trả lời thay. Cửa tầng 3 mở và đợi.',
     wrong:'Bảy cất chìa khóa. “Cần vẫn dưới nắp bàn.” Ông đi về chiếu nghỉ cũ, để chiếc ghế phía bên kia quầy trống. Lần này ông không nói hộ bạn điều gì.'},
    {id:12,night:3,person:'linh',floor:0,quote:'Cho em về ghế trực. Em còn một câu chưa nói hết. Chị đừng tua qua tiếng đếm nữa.',note:'Cô gái mặc đồng phục cũ, rất trẻ. Tay trái có một vết bỏng mới, đúng chỗ vết sẹo trắng trên tay bạn.',safe:true,evidenceKey:'c',
     r:'Linh · nhân viên trực năm 2013 · 19 tuổi. Phiếu y tế ghi được đưa khỏi phòng điều khiển lúc 02:06, còn sống. Có chữ ký nhận lại tư trang và chữ ký xác nhận cabin trống.',
     c:'Không có người mới vào sảnh. Camera phát phần bị cắt khỏi bàn trực 2013: cô gái cầm máy nói “Cô ở đây. Cứ đếm đến mười.” Ở màn hình hiện tại, tay bạn vô thức giữ máy cùng một cách.',
     l:'Đây là đoạn ghi tại bàn G, nối liền với 11 giây bị cắt; không có yêu cầu đổi tên hoặc quyền ra cổng. Con trỏ dừng ở chỗ người lập biên bản phải tự đọc lại lời khai.',
     outcome:'Bạn mở lối về bàn G. Cô gái ngồi xuống; ký ức khớp vào đúng chiếc ghế của bạn. Vết bỏng trên hình nằm dưới vết sẹo trên tay. Tiếng đếm bắt đầu, và lần này bạn không tua qua.',
     wrong:'Bạn khóa lối về bàn G. Cô gái đặt máy xuống rồi mất hình. Ký ức còn bị giữ riêng, nhưng băng gốc vẫn nằm trong máy: tiếng đếm chưa từng bị xóa.'}
  ];
  var scenes=[
    {name:'CA TRỰC THỨ NHẤT',subtitle:'Một chiếc ghế còn trống',body:'Ba đêm nữa, bộ điều khiển thang máy cũ sẽ bị tháo và xóa bộ nhớ. Bạn tự xin trực những ca cuối. Phong bì tiền công vẫn còn niêm. Dưới ô LINH là một vệt mực bị bàn tay che lại. Bạn bỏ bàn tay ra, chỉ thấy vết sẹo trắng trên cổ tay. Loa thử đường dây: một, hai, ba... rồi dừng. Bạn kéo ghế ngồi, không thử lại.',line:'Trên bàn có một tờ giấy mới: “Khách chưa được xác nhận thì gọi lại bằng số trong sổ. Đừng dùng số họ vừa đưa.”'},
    {name:'CA TRỰC THỨ HAI',subtitle:'Khoảng băng mười một giây',body:'Đêm thứ hai. Bạn đã về nhà rồi quay lại, vẫn mặc áo từ ca trước. Ngoài sảnh, đồng hồ chỉ quá nửa đêm; đồng hồ bàn trực lại ở 01:13. Trên ghế có một tai gấu bằng vải, đường chỉ đỏ còn dang dở. Máy báo tìm được 11 giây âm thanh không nằm trong bản bàn giao. Bạn đặt tai gấu vào ngăn kéo.',line:'Giọng một đứa trẻ được chép trên màn hình: “Cô còn ở đó không?”'},
    {name:'CA TRỰC CUỐI CÙNG',subtitle:'Người đã trả lời',body:'Đêm thứ ba. Bên ngoài, thợ đã đánh dấu những dây sẽ cắt sáng mai. Đồng hồ bàn trực vẫn ở 01:13. Bạn mở ngăn kéo: tai gấu nằm trên tờ biên bản mình đã giấu từ đêm đầu. Chữ ký dưới dòng xác nhận là của bạn. Máy hỏi có nhập lời khai cũ sang bộ điều khiển mới không. Bạn chưa bấm.',line:'Mục ghi âm có hai giọng. Một giọng biết chờ. Giọng còn lại chỉ biết bảo người khác chờ.'}
  ];
  var inspectionSources={
    registry:{key:'r',label:'CƯ DÂN / RESIDENT DATABASE'},
    camera:{key:'c',label:'CCTV / CAMERA 01'},
    log:{key:'l',label:'NHẬT KÝ / SYSTEM LOG'}
  };
  var memoryStorage=Object.create(null),pendingStorage=new Set();
  function readStorage(key){
    if(pendingStorage.has(key))return memoryStorage[key];
    try{var value=window.localStorage.getItem(key);memoryStorage[key]=value;return value}
    catch(e){return Object.prototype.hasOwnProperty.call(memoryStorage,key)?memoryStorage[key]:null}
  }
  function writeStorage(key,value){
    memoryStorage[key]=value;
    try{window.localStorage.setItem(key,value);pendingStorage.delete(key)}catch(e){pendingStorage.add(key)}
  }
  function removeStorage(key){
    memoryStorage[key]=null;
    try{window.localStorage.removeItem(key);pendingStorage.delete(key)}catch(e){
      // A writable tombstone also prevents an old save returning after reload.
      try{window.localStorage.setItem(key,'null');pendingStorage.delete(key)}catch(err){pendingStorage.add(key)}
    }
  }
  var state=null,tab='registry',muted=readStorage(SOUND_KEY)==='off',audio=window.ElevatorAudio,platform=window.ElevatorPlatform,platformPaused=false,endingShown=false,toastTimer=null;
  audio.onStatusChange=updateSoundControls;
  audio.setMuted(muted);
  var overlay=$('#overlay'),overlayCard=$('#overlay-card');
  var fresh=function(){return {i:0,score:0,trust:2,breach:0,evidence:0,correct:0,wrong:0,history:[],found:[],opened:[],started:Date.now(),endings:[]}};
  function nonnegativeInteger(n){return Number.isSafeInteger(n)&&n>=0}
  function validSave(s){
    if(!s||!nonnegativeInteger(s.i)||s.i>cases.length)return false;
    if(!['score','trust','breach','evidence','correct','wrong','started'].every(function(k){return nonnegativeInteger(s[k])}))return false;
    if(!Array.isArray(s.history)||s.history.length!==s.i||!Array.isArray(s.found))return false;
    if(s.correct+s.wrong!==s.i||s.breach>s.wrong||s.trust>2+s.correct)return false;
    if(s.evidence!==s.found.length||new Set(s.found).size!==s.found.length)return false;
    if(!s.found.every(function(id){return Number.isInteger(id)&&id>0&&id<=Math.min(s.i+1,cases.length)&&!!cases[id-1].evidenceKey}))return false;
    if(s.score>s.i*100+s.evidence*25)return false;
    if(!s.history.every(function(h,i){return h&&h.id===cases[i].id&&typeof h.name==='string'&&['admit','deny'].includes(h.action)&&h.correct===((h.action==='admit')===cases[i].safe)}))return false;
    if(s.correct!==s.history.filter(function(h){return h.correct}).length)return false;
    // Older saves predate persisted scans; all other fields must still be valid.
    if(s.opened===undefined)s.opened=[];
    return Array.isArray(s.opened)&&s.opened.length<=2&&new Set(s.opened).size===s.opened.length&&s.opened.every(function(k){return Object.prototype.hasOwnProperty.call(inspectionSources,k)})&&(s.i<cases.length||s.opened.length===0);
  }
  function load(){try{var s=JSON.parse(readStorage(SAVE_KEY));if(validSave(s))return s}catch(e){}return null}
  function save(){writeStorage(SAVE_KEY,JSON.stringify(state))}
  function best(){
    try{
      var b=JSON.parse(readStorage(BEST_KEY));
      if(b&&nonnegativeInteger(b.score)&&Array.isArray(b.endings)&&new Set(b.endings).size===b.endings.length&&b.endings.every(function(k){return ['keeper','replacement','truth','silence'].includes(k)}))return b;
    }catch(e){}
    return {score:0,endings:[]};
  }
  function recordBest(ending){var b=best();b.score=Math.max(b.score,state.score);if(!b.endings.includes(ending))b.endings.push(ending);writeStorage(BEST_KEY,JSON.stringify(b))}
  function setBackgroundInert(value){$$('.topbar,#game-shell,#game-footer').forEach(function(el){el.inert=value})}
  function uiOverlay(html){
    overlayCard.innerHTML=html;
    var title=overlayCard.querySelector('h1,h2');if(title)title.id='overlay-title';
    overlay.classList.add('visible');setBackgroundInert(true);overlay.focus({preventScroll:true});
  }
  function hideOverlay(){overlay.classList.remove('visible');setBackgroundInert(false);$('#visitor-name').focus({preventScroll:true})}
  function button(label,handler,secondary){var b=document.createElement('button');b.className=secondary?'secondary-cta':'main-cta';b.textContent=label;b.addEventListener('click',function(){if(platformPaused)return;activateAudio();handler()});return b}
  function addButtons(items){
    var wrap=document.createElement('div');wrap.className='cta-row';
    items.forEach(function(item){wrap.appendChild(button(item[0],item[1],item[2]))});
    var toggle=button('',toggleSound,true);toggle.dataset.soundToggle='';wrap.appendChild(toggle);
    var status=document.createElement('p');status.className='audio-status';status.style.fontSize='12px';status.dataset.audioStatus='';status.setAttribute('role','status');
    overlayCard.appendChild(wrap);overlayCard.appendChild(status);updateSoundControls();wrap.querySelector('button').focus({preventScroll:true});
  }
  function activateAudio(){if(!muted&&!endingShown&&!platformPaused)audio.start()}
  function sound(type){if(!muted)audio.play(type)}
  function updateSoundControls(){
    $$('[data-sound-toggle]').forEach(function(control){
      var label=muted?'Bật âm thanh':'Tắt âm thanh';
      control.textContent=control.id==='sound-toggle'?(muted?'♪̸':'♫'):label.toUpperCase();
      control.title=label;control.setAttribute('aria-label',label);control.setAttribute('aria-pressed',muted?'false':'true');
    });
    var labels={ready:'Nhạc nền: chờ bạn bấm bắt đầu.',loading:'Nhạc nền: đang tải…',playing:'Nhạc nền: đang phát.',muted:'Âm thanh đang tắt.',paused:'Nhạc nền: tạm dừng. Bấm bật âm thanh để tiếp tục.',stopped:'Nhạc nền đã dừng ở kết thúc.',blocked:'Trình duyệt chưa cho phép phát nhạc. Thử tắt rồi bật âm thanh hoặc cho phép âm thanh cho trang này.',failed:'Không tải/phát được nhạc. Thử tắt rồi bật âm thanh để tải lại.'};
    $$('[data-audio-status]').forEach(function(el){el.textContent=labels[audio.status()]||labels.ready});
  }
  function toggleSound(){
    if(platformPaused)return;
    muted=!muted;writeStorage(SOUND_KEY,muted?'off':'on');audio.setMuted(muted);
    if(!muted&&!endingShown){activateAudio();sound('scan')}
    updateSoundControls();toast(muted?'Âm thanh đã tắt':audio.supported?'Âm thanh đã bật':'Trình duyệt không hỗ trợ âm thanh');
  }
  function toast(msg){var el=$('#toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('visible')},2400)}
  function showIntro(){
    $('#game-shell').hidden=true;$('#game-footer').hidden=true;
    var b=best(),hasSave=!!load();
    uiOverlay('<div class="intro-kicker">VESPER TOWER · INCIDENT FILE 013</div><h1 class="hero-title">THE LAST<br><span>ELEVATOR.</span></h1><p class="lead">01:13 sáng. Tòa nhà chỉ có 12 tầng. Một người vừa bấm số 13.<br>Bạn là Linh, người nhận ba ca cuối trước khi bộ điều khiển cũ bị tháo. Đêm đầu tiên, điện thoại bàn nhận một cuộc gọi không có số. Bên kia, có người vẫn đang đợi bạn trả lời.</p><div class="quote">KIỂM TRA. SUY LUẬN. QUYẾT ĐỊNH.<br>Có những cánh cửa chỉ mở được khi người bên ngoài chịu ở lại.</div><div class="intro-stats"><div><span>CA TRỰC</span><strong>03 NIGHTS</strong></div><div><span>HÀNH KHÁCH</span><strong>12 CASES</strong></div><div><span>ĐIỂM CAO NHẤT</span><strong>'+String(b.score).padStart(4,'0')+'</strong></div></div><p class="lead" style="font-size:12px">Khuyến nghị bật âm thanh, nhưng game có thể chơi hoàn toàn không cần tiếng.</p>');
    addButtons(hasSave?[['TIẾP TỤC CA TRỰC →',function(){state=load();platform.begin();startCase()},false],['CA MỚI',startNew,true]]:[['BẮT ĐẦU CA TRỰC →',startNew,false]]);
  }
  function startNew(){platform.begin();endingShown=false;state=fresh();save();showNightIntro(1)}
  function showNightIntro(n){
    var s=scenes[n-1];
    audio.setNight(n);sound('night');
    uiOverlay('<span class="scene-label">VESPER TOWER / NIGHT 0'+n+' · '+s.subtitle+'</span><h2>'+s.name+'</h2><p class="lead">'+escapeHTML(nightBody(n))+'</p><div class="quote">'+s.line+'</div><div class="instruction-list"><div class="instruction-item"><b>QUY TẮC 01.</b> Tối đa 2 nguồn xác minh khác nhau; có thể đọc lại nguồn đã mở.</div><div class="instruction-item"><b>QUY TẮC 02.</b> Đối chiếu hồ sơ với hành trình và yêu cầu thực tế. Từ chối nhầm làm giảm độ tin cậy.</div><div class="instruction-item"><b>QUY TẮC 03.</b> Giữ bản ghi gốc. Mọi lệnh xóa dữ liệu hoặc cấp thẻ mới đều cần xác nhận độc lập.</div></div>');
    addButtons([['BẮT ĐẦU NIGHT 0'+n+' →',startCase,false]]);
  }
  function nightOf(i){return i<4?1:i<8?2:3}
  function startCase(){
    if(!state)return showIntro();
    if(state.i>=cases.length)return showFinale();
    tab='registry';
    $('#game-shell').hidden=false;$('#game-footer').hidden=false;
    audio.setNight(nightOf(state.i));activateAudio();render();hideOverlay();save();
  }
  function render(){
    var item=cases[state.i],person=people[item.person];
    $('#night-indicator').innerHTML='NIGHT 0'+nightOf(state.i)+' <span>•</span> '+String(state.i%4+1).padStart(2,'0')+' / 04';
    $('#floor-indicator').textContent=item.floor===0?'G':String(item.floor).padStart(2,'0');
    $('#visitor-number').textContent='#'+String(item.id).padStart(3,'0');
    $('#visitor-name').textContent=person.name;$('#visitor-floor').textContent=item.floor===0?'PHÒNG BẢO VỆ':'YÊU CẦU TẦNG '+String(item.floor).padStart(2,'0');
    $('#visitor-dialogue').textContent='“'+caseQuote(item)+'”';
    $('#visitor-note').textContent=caseNote(item);
    $('#visitor-avatar').innerHTML=portrait(person,item);
    $('#score-status').textContent=String(Math.max(0,state.score)).padStart(4,'0')+' PTS';
    $('#trust-status').textContent='TRUST '+String(Math.max(0,state.trust)).padStart(2,'0');
    $('#breach-status').textContent='BREACH '+String(state.breach).padStart(2,'0');
    $('#evidence-status').textContent='EVIDENCE '+String(state.evidence).padStart(2,'0');
    // The tower's transmission degrades by night, regardless of who is at the door.
    var degraded=nightOf(state.i)>1;
    $('#signal-value').textContent=degraded?'UNSTABLE':'STABLE';
    $('#signal-value').style.color=degraded?'#e9c17a':'#a8d8b1';
    $('#inspection-report').innerHTML='<span class="eyebrow">SCAN RESULT</span><p>Chọn một nguồn xác minh để đọc kết quả. Mỗi hành khách có tối đa hai lượt kiểm tra.</p>';
    updateInspectionControls();
    if(state.opened.length)renderClue(state.opened[state.opened.length-1]);
    selectDossierTab(tab);updateClock();
  }
  function updateClock(){
    if(!state||state.i>=12)return;
    var sec=13+state.i*3,minute=13+Math.floor(sec/60);sec=sec%60;
    $('#clock').textContent='01:'+String(minute).padStart(2,'0')+':'+String(sec).padStart(2,'0');
    $('#top-status-label').textContent=nightOf(state.i)===3?'SIGNAL DEGRADED':'SECURE CHANNEL';
  }
  function selectDossierTab(value){
    tab=value;
    $$('.tab').forEach(function(b){var selected=b.dataset.tab===tab;b.classList.toggle('active',selected);b.setAttribute('aria-selected',selected?'true':'false');b.tabIndex=selected?0:-1});
    renderDossier();
  }
  function renderDossier(){
    var html='';
    if(tab==='registry'){
      html='<div class="dossier-group-title">RESIDENT DATABASE / REV. 2026</div>';
      residents.forEach(function(p){html+='<div class="registry-entry"><strong>'+escapeHTML(p[0])+'</strong><small>'+escapeHTML(p[1])+' · '+escapeHTML(p[2])+'</small></div>'});
    }else if(tab==='rules'){
      html='<div class="dossier-group-title">BUILDING PROTOCOL</div>'+
      '<div class="rule-entry"><b>01 /</b> Tòa nhà chỉ có 12 tầng được phép vận hành.</div>'+
      '<div class="rule-entry"><b>02 /</b> Khách không có tên trong sổ có thể được cho vào nếu có xác nhận hợp lệ.</div>'+
      '<div class="rule-entry"><b>03 /</b> Camera có thể nhiễu. Không đưa ra kết luận chỉ từ một dấu hiệu.</div>'+
      '<div class="rule-entry"><b>04 /</b> Người không có hồ sơ hiện tại cần được đối chiếu với bản lưu và người đón.</div>'+
      '<div class="rule-entry"><b>05 /</b> Nếu xuất hiện hai bản ghi cùng một người, phải kiểm tra hành trình.</div>'+
      '<div class="rule-entry"><b>06 /</b> Không bao giờ thực hiện lệnh xóa log từ hành khách.</div>';
    }else{
      html='<div class="dossier-group-title">SECURITY ACTION LOG</div>';
      if(!state.history.length)html+='<div class="log-entry">Chưa có quyết định. Hệ thống đang ghi nhận ca trực.</div>';
      state.history.slice().reverse().forEach(function(h){html+='<div class="log-entry"><b>CASE #'+String(h.id).padStart(3,'0')+'</b> — '+escapeHTML(h.name)+'<br>'+escapeHTML(h.action==='admit'?'ADMIT':'DENY')+' · '+(h.correct?'VERIFIED':'INCIDENT')+'</div>'});
    }
    $('#dossier-content').innerHTML=html;
  }
  function wasAdmitted(id){return state.history.some(function(h){return h.id===id&&h.action==='admit'})}
  function choiceEcho(id){
    var entry=state.history.find(function(h){return h.id===id});
    if(!entry)return '';
    return people[cases[id-1].person].name+' — '+(entry.action==='admit'?'CHO PHÉP':'TỪ CHỐI');
  }
  function caseQuote(item){
    if(item.id===9&&!wasAdmitted(2))return 'Đơn từ đêm đầu bị chị từ chối. D-719. Em vẫn chờ. Chị đã về nhà rồi, đúng không?';
    return item.quote;
  }
  function caseNote(item){
    if(item.id===11&&!wasAdmitted(3))return 'Bảy còn mang chùm chìa khóa từ lần bạn không cho ông lên tầng 3. Ông đặt nó xuống, vẫn giữ đầu sợi chỉ đỏ trong tay.';
    return item.note;
  }
  function nightBody(n){
    var body=scenes[n-1].body;
    if(n===2)body+=' Trong ngăn bản ghi, lượt mang thẻ Minh '+(wasAdmitted(4)?'đã được cho vào; phiên không chủ vẫn sáng.':'đã bị từ chối; phiên không chủ chưa được mở.');
    return body;
  }
  function nightSummaryText(done){
    if(done===1){
      var visitor=wasAdmitted(4)?'Cabin đã mang người có thẻ Minh lên tầng 6. Camera 602 ghi một bàn tay giữ cửa từ bên trong.':'Người có thẻ Minh vẫn ở ngoài khi cửa đóng. Vậy mà loa trong cabin phát tiếng anh ta ho.';
      return visitor+' Trời sáng. Bạn bước ra cổng, gọi xe về nhà. Điện thoại hiện bản chép âm từ máy trực: “'+choiceEcho(4)+'.” Bên dưới là nhãn 2013. Bạn vừa chọn câu đó đêm nay. Trong bản sóng, sau giọng người trực có mười nhịp gõ.';
    }
    var repair=wasAdmitted(5)?'Minh để lại bản chẩn đoán và nhắn: “Đừng giao máy khi chưa nghe hết.”':'Minh đã rời đi, không trao bản sao chẩn đoán. Phiếu cũ lưu sẵn trong máy có số để gọi lại; bạn chưa gọi.';
    var child=wasAdmitted(6)?'An đang đợi trong chuyến cabin. Chỗ cạnh con gấu vẫn để trống.':'An vẫn chờ ở chiếu nghỉ tầng 9. Camera chỉ còn thấy hai bàn chân dưới gấu áo.';
    var order=wasAdmitted(8)?'Lệnh xóa đã nhận được quyền, nhưng chưa chạm tới vùng chỉ đọc.':'Lệnh xóa bị chặn. Bản lưu gốc vẫn chờ người đọc tên mình.';
    return repair+' '+child+' '+order+' Màn hình chép lại “'+choiceEcho(6)+'”, rồi “'+choiceEcho(8)+'”. Cả hai được gắn vào một giọng. Khi về tới nhà, bạn đứng ngoài cửa rất lâu mới dám gọi người bên trong.';
  }
  function clueText(item,key){
    if(item.id===5&&key==='l')return 'Hai lượt thẻ Minh đêm đầu; lượt ở sảnh '+(wasAdmitted(4)?'đã được cho vào. Phiên không có mã chủ còn hoạt động.':'đã bị từ chối. Không có phiên phụ được mở.')+' Bộ lưu 2013 có 11 giây bị tách khỏi báo cáo. Rơ-le từng giữ cabin ở chiếu nghỉ 13; nguồn phụ chỉ nuôi đèn và chốt cứu hộ.';
    if(item.id===7&&key==='c')return item.c+' Bản chép âm đang ghép lại một lệnh vừa lưu: “'+choiceEcho(4)+'.” Không có âm gốc riêng cho người mặc áo khoác.';
    if(item.id===9){
      if(key==='r'&&!wasAdmitted(2))return 'D-719 chưa được giao vì bị từ chối đêm đầu. Mã hết hạn; 1102 không đặt lại. Yêu cầu mới đến từ máy nội bộ đã bị tháo sau sự cố 2013.';
      if(key==='l')return (wasAdmitted(2)?'1102 đã nhận đồ ở đêm đầu.':'1102 chưa nhận đồ sau lần giao bị từ chối.')+' Không có đơn mới. Bản chép âm đính kèm: “'+choiceEcho(2)+'.” Gói âm chỉ có tiếng đã lưu ở bàn trực, không có tiếng phố trong ca hiện tại.';
    }
    if(item.id===10){
      if(key==='l')return (wasAdmitted(1)?'Đêm đầu có một lượt lên tầng 8 sau khi Mai được cho vào.':'Yêu cầu lên tầng 8 của Mai đã bị từ chối; cô đi cầu thang.')+' Lượt đang xin dùng lại nguyên dấu thời gian cũ, không có lần quẹt mới. Kèm theo là lệnh bàn trực: “'+choiceEcho(1)+'.”';
      if(key==='c')return item.c+' Phần tiếng dưới sảnh lặp “'+choiceEcho(1)+'”, không khớp môi Mai trên cuộc gọi hình.';
    }
    return item[key];
  }
  function renderClue(kind){
    var item=cases[state.i],source=inspectionSources[kind];
    var evidence=item.evidenceKey===source.key&&state.found.includes(item.id);
    $('#inspection-report').innerHTML='<span class="eyebrow">'+source.label+'</span><p>'+escapeHTML(clueText(item,source.key))+'</p>'+(evidence?'<span class="report-evidence">✦ ĐÃ THU THẬP BẰNG CHỨNG</span>':'');
  }
  function updateInspectionControls(){
    $$('.inspection-button').forEach(function(b){var opened=state.opened.includes(b.dataset.inspect);b.disabled=!opened&&state.opened.length>=2;b.classList.toggle('used',opened)});
    $('#scans-left').textContent=String(2-state.opened.length).padStart(2,'0')+' / 02';
  }
  function inspect(kind){
    if(platformPaused||!state||$('#game-shell').hidden||overlay.classList.contains('visible')||!Object.prototype.hasOwnProperty.call(inspectionSources,kind))return;
    var item=cases[state.i];if(!item)return;
    if(state.opened.includes(kind)){
      // Keep the latest viewed source last so existing saves restore it after reload.
      state.opened=state.opened.filter(function(source){return source!==kind}).concat(kind);
      save();renderClue(kind);return;
    }
    if(state.opened.length>=2)return;
    state.opened.push(kind);sound(kind==='camera'?'camera':'scan');
    if(item.evidenceKey===inspectionSources[kind].key&&!state.found.includes(item.id)){state.found.push(item.id);state.evidence++;state.score+=25}
    save();renderClue(kind);updateInspectionControls();
    $('#evidence-status').textContent='EVIDENCE '+String(state.evidence).padStart(2,'0');
    $('#score-status').textContent=String(Math.max(0,state.score)).padStart(4,'0')+' PTS';
    if(kind==='camera'&&item.spooky){$('#elevator-stage').classList.remove('glitch');void $('#elevator-stage').offsetWidth;$('#elevator-stage').classList.add('glitch')}
  }
  function decide(action){
    if(platformPaused||!state||state.i>=12||overlay.classList.contains('visible'))return;
    var item=cases[state.i],correct=(action==='admit')===item.safe;
    sound(correct?'door':'bad');
    if(correct){state.correct++;state.score+=100;if(item.safe)state.trust++}
    else{state.wrong++;state.score=Math.max(0,state.score-70);if(item.safe)state.trust=Math.max(0,state.trust-2);else{state.breach++;state.trust=Math.max(0,state.trust-1)}}
    state.history.push({id:item.id,name:people[item.person].name,action:action,correct:correct});
    state.i++;state.opened=[];save();
    var resultText=correct?item.outcome:item.wrong;
    var tag=correct?'QUYẾT ĐỊNH CHÍNH XÁC':'CẢNH BÁO / QUYẾT ĐỊNH SAI';
    var heading=correct?(action==='admit'?'ACCESS GRANTED':'ACCESS DENIED'):'ANOMALY DETECTED';
    if(!correct)document.body.classList.add('shock'),setTimeout(function(){document.body.classList.remove('shock')},380);
    uiOverlay('<span class="scene-label">'+tag+'</span><h2>'+heading+'</h2><p class="lead">'+escapeHTML(resultText)+'</p><div class="result-grid"><div class="result-item"><strong>'+String(state.correct).padStart(2,'0')+'</strong><small>ĐÚNG</small></div><div class="result-item"><strong>'+String(state.wrong).padStart(2,'0')+'</strong><small>SAI</small></div><div class="result-item"><strong>'+String(state.evidence).padStart(2,'0')+'</strong><small>BẰNG CHỨNG</small></div></div><div class="result-message">'+(correct?'Quyết định đã được xác nhận. Những điều bạn vừa thấy vẫn còn giá trị ở ca sau.':'Một sai lầm đã được ghi lại. Hãy đối chiếu các dấu vết còn lại; câu chuyện vẫn tiếp tục.')+'</div>');
    addButtons([[(state.i>=12?'ĐẾN CHUYẾN CUỐI CÙNG':state.i%4===0?'KẾT THÚC CA TRỰC':'HÀNH KHÁCH TIẾP THEO')+' →',function(){
      if(state.i>=12)showFinale();
      else if(state.i%4===0)showNightSummary();
      else startCase();
    },false]]);
  }
  function showNightSummary(){
    var done=nightOf(state.i-1),next=done+1;
    uiOverlay('<span class="scene-label">NIGHT 0'+done+' / SHIFT COMPLETE</span><h2>BẢN GHI<br>CA TRỰC</h2><p class="lead">'+escapeHTML(nightSummaryText(done))+'</p><div class="result-grid"><div class="result-item"><strong>'+state.correct+'</strong><small>ĐÚNG</small></div><div class="result-item"><strong>'+state.breach+'</strong><small>BREACH</small></div><div class="result-item"><strong>'+state.evidence+'</strong><small>EVIDENCE</small></div></div><div class="quote">'+(done===1?'BẢN CHÉP ÂM / KÊNH KHÔNG XÁC ĐỊNH: “Cô còn ở đó không?”':'BẢN CHÉP ÂM / 11 GIÂY CÒN LẠI: “Tám... chín...”')+'</div>');
    addButtons([['TIẾP TỤC NIGHT 0'+next+' →',function(){showNightIntro(next)},false]]);
  }
  function showFinale(){
    var memory=wasAdmitted(12)?'Bạn để cô gái trên băng nói hết.':'Bạn đã khóa lối về bàn G. Máy vẫn giữ băng gốc; bạn có thể quay mặt đi, không thể làm nó chưa từng tồn tại.';
    uiOverlay('<span class="scene-label">01:13 AM / ORIGINAL RECORDING</span><h2>MƯỜI MỘT<br><span class="ending-title">GIÂY CUỐI.</span></h2><p class="lead">'+escapeHTML(memory)+' Ảnh dừng ở tay bạn trên công tắc có chỉ đỏ. Trên bản chép âm, An đếm đủ mười.</p><div class="quote" data-original-recording>AN: “Tám. Chín. Mười. Cô ơi?”<br>[Tiếng ngắt nguồn phụ. Chốt cứu hộ đóng.]<br>LINH: “Không còn ai trong cabin.”</div><p class="lead">Bạn đã nghe con bé. Bạn sợ đường điện chập, cắt cả nguồn phụ rồi ký xác nhận trống. Bảy, An và Vân bị gạch khỏi báo cáo. Bạn được đưa ra ngoài lúc 02:06. Bạn đã về nhà đêm ấy. Họ thì không.</p><p class="lead">Đường loa bây giờ ghép “'+escapeHTML(choiceEcho(2))+'” vào cùng giọng trong băng. Nó chưa từng có một tiếng nói riêng. Mười ba năm nay, nó trú dưới câu cabin trống. Đêm nay, nó học thêm những lời bạn cho phép và từ chối. Chỉ còn thiếu một chữ ký bàn giao để mang giọng bạn ra khỏi chiếc máy này.</p><div class="quote">PHỤ LỤC: BẢY · AN · VÂN — CHƯA TRỞ VỀ.<br>NGƯỜI XÁC NHẬN: LINH — CÒN SỐNG.<br>Dòng khắc dưới nắp bàn: ngắt nguồn chính, giữ nguồn phụ, kéo cần mở cửa cứu hộ bằng tay.</div><p class="lead">Khóa tầng 13 giữ cửa đóng và giữ nguyên lời khai. Cắt cả hai nguồn dừng việc đối chiếu; đến sáng, đội thợ sẽ xóa bộ nhớ cũ. Mở cửa sẽ đưa bản đối chiếu vào hồ sơ bàn giao: nếu thiếu bằng chứng, mất xác nhận từ những người đã gặp hoặc còn quá nhiều phiên không tên, thứ trong loa có thể ký thay bạn.</p><p class="lead">Bằng chứng thu thập: <strong>'+state.evidence+'</strong> · Độ tin cậy: <strong>'+state.trust+'</strong> · Phiên không tên: <strong>'+state.breach+'</strong></p><p class="lead" style="font-size:12px">Lần này, dưới câu trả lời sẽ là tên ai?</p>');
    addButtons([['KHÓA TẦNG 13',function(){showEnding('keeper')},true],['MỞ CỬA TẦNG 13',function(){showEnding(state.evidence>=4&&state.trust>=4&&state.breach<=1?'truth':'replacement')},false],['CẮT NGUỒN ĐIỆN',function(){showEnding('silence')},true]]);
  }
  var endings={
    keeper:{title:'THE KEEPER',subtitle:'Không ai qua cửa. Không ai được trả lời.',text:'Bạn khóa chiếu nghỉ 13, giữ nguồn phụ sáng. Bên trong, có người thử tay nắm một lần rồi thôi. Bạn ký bàn giao nguyên trạng. Sáng ra, đội thợ tháo bộ điều khiển; bản sao dữ liệu được nhập sang máy mới. Trong ngày nghiệm thu, loa thử bằng giọng bạn: “Không còn ai trong cabin.” Mọi người gật đầu vì âm thanh rất rõ. Chỉ bạn nghe được tiếng đếm phía sau.',tone:'Bạn giữ được cửa. Câu nói cũ đi tiếp mà không cần mở cửa.'},
    replacement:{title:'THE REPLACEMENT',subtitle:'Bản bàn giao hợp lệ. Người ký không có lượt ra.',text:'Cửa mở trước khi các bản đối chiếu khớp nhau. Ô ký tên nhận nét chữ từ bản ghi người trực; những ô làm chứng vẫn chưa khớp. Trong camera cổng, Linh trả thẻ, nói cảm ơn rồi đi ra ngoài. Bạn còn ngồi ở bàn, bàn tay xuyên qua máy nói. Điện thoại của bạn trên camera đổ chuông. Người vừa ra cổng áp máy vào tai: “Tôi ở đây.” Bạn đập vào kính. Hệ thống lưu tiếng đó vào mục TẠP ÂM.',tone:'Thứ ấy không cần giống bạn mãi. Nó chỉ cần người ở nhà mở cửa một lần.'},
    truth:{title:'THE TRUTH',subtitle:'Có ba người trong cabin. Tôi đã nghe thấy họ.',text:'Bạn đọc lời khai mới bằng tên mình. Giọng trong loa thử chen “không còn ai”, nhưng câu ấy giờ nằm cạnh ba cái tên và bản âm gốc; nó không còn một ô trống để ký thay. Tiếng đếm dừng. Sáng ra, Linh ngồi trước người nhận bàn giao, yêu cầu giữ cả báo cáo sai lẫn bản đính chính. Tờ sau có câu: “Tôi đã nghe thấy họ. Tôi vẫn ký.” Bạn không gọi đó là được tha thứ. Khi rời phòng, điện thoại rung: Mai gửi ảnh một chậu cây ở cửa sổ. Đồng hồ trên ảnh đã qua 01:14.',tone:'Lần này bạn không được xóa khỏi câu chuyện. Những người kia cũng vậy.'},
    silence:{title:'THE SILENCE',subtitle:'Không còn bản ghi. Không có nghĩa là không còn ai.',text:'Bạn cắt nguồn chính rồi cả nguồn phụ. Chốt cứu hộ đóng. Chỉ đỏ rơi xuống nền, cạnh tai gấu trong ngăn kéo mở. Sáng ra, đội thợ chép báo cáo đã duyệt rồi xóa dữ liệu cũ theo lịch bàn giao. Hồ sơ mới vẫn ghi cabin trống. Đoạn âm còn lại chưa từng được đưa vào đó. Bạn về nhà. Đêm đó, trong lúc ngủ, bạn nghe mình đếm tới chín rồi nín thở. Không có giọng nào đếm hộ số cuối.',tone:'Bạn có thể làm chiếc máy im. Bạn đã thử điều đó một lần rồi.'}
  };
  function endingText(key){
    if(key==='keeper')return endings.keeper.text+' Bản bàn giao còn dòng thao tác cuối: “'+choiceEcho(12)+'.”';
    if(key==='replacement')return 'Dòng được dùng làm mẫu chữ ký: “'+choiceEcho(2)+'.” '+endings.replacement.text;
    if(key!=='truth')return endings[key].text;
    var opening=wasAdmitted(11)?'Ông Bảy tra chiếc chìa khóa vào ổ cũ. Bạn ngắt nguồn chính, giữ nguồn phụ và kéo cần mở cửa thủ công. ':'Không có chìa khóa được trao. Theo dòng khắc dưới nắp bàn trực, bạn ngắt nguồn chính, giữ nguồn phụ rồi kéo cần mở cửa thủ công. ';
    var child=wasAdmitted(6)?'Từ cabin, Bé An đưa con gấu cho mẹ rồi quay nhìn chiếc ghế trực. ':'Từ chiếu nghỉ tầng 9, An nghe mẹ gọi và đi về phía cửa cứu hộ. Con gấu đi trước, như để thử xem lần này có ai giữ cửa. ';
    var memory=wasAdmitted(12)?'Phần ký ức đã trở về nằm nguyên trong lời khai mới, kể cả tiếng bạn trả lời sau khi nghe An. ':'Bạn giữ cả đoạn ký ức bị từ chối ở bàn G trong lời khai; không có cô gái nào hiện ra để ký hộ. ';
    var intruder=state.breach?'Bạn hủy lượt mượn tên đã lọt vào cabin bằng bản đối chiếu, giữ phiên ấy sau cửa. ':'Bản đối chiếu không có phiên không tên nào cần nhận thay một hành khách. ';
    return intruder+opening+child+'Bảy giữ cửa cho Vân và An qua hết. Hình ba người nhạt dần. Băng chạy hết, camera sảnh trở về một khung không người. Chiếc tai vải trên quầy cũng mất, còn đường chỉ đỏ hằn trên tay bạn. '+memory+endings.truth.text;
  }
  function showEnding(key){
    var e=endings[key];recordBest(key);
    endingShown=true;
    platform.finish({score:state.score,ending:key,correct:state.correct,evidence:state.evidence,breach:state.breach});
    audio.finish(key);
    removeStorage(SAVE_KEY);
    var rank=state.correct>=10?'S':state.correct>=8?'A':state.correct>=6?'B':'C';
    uiOverlay('<span class="scene-label">ENDING UNLOCKED / '+(key==='truth'?'SECRET':'STANDARD')+'</span><h2 class="ending-title">'+e.title+'</h2><p class="lead">'+e.subtitle+'</p><p class="ending-copy">'+escapeHTML(endingText(key))+'</p><div class="quote">'+e.tone+'</div><div class="result-grid"><div class="result-item"><strong>'+rank+'</strong><small>RANK</small></div><div class="result-item"><strong>'+state.correct+'/12</strong><small>ĐÚNG</small></div><div class="result-item"><strong>'+state.score+'</strong><small>ĐIỂM</small></div></div><p class="lead" style="font-size:12px">Đã mở khóa '+best().endings.length+'/4 kết thúc. Chơi lại để tìm sự thật khác.</p>');
    addButtons([['CHƠI LẠI →',startNew,false],['SAO CHÉP THÀNH TÍCH',function(){
      var msg='THE LAST ELEVATOR — FLOOR 13\nENDING: '+e.title+'\nRANK '+rank+' · '+state.score+' PTS · '+state.correct+'/12\nBạn có dám trực ca đêm không?';
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(msg).then(function(){toast('Đã sao chép thành tích')}).catch(function(){toast('Không sao chép được')});
      else toast('Trình duyệt không hỗ trợ sao chép');
    },true]]);
  }
  function portrait(p,item){
    // Original deterministic SVG character art: single-file, no external character assets.
    var child=p.gender==='child',faceless=p.gender==='faceless',woman=p.gender==='woman';
    var headY=child?99:79,bodyTop=child?157:146,face=p.skin;
    var eye=faceless?'#0a0d11':'#1a2227';
    var hairPath=woman?'M78 73 Q85 17 132 30 Q171 35 165 88 L170 159 L150 144 L145 84 Q112 92 82 84 L75 144 L63 153 Z':
      child?'M80 85 Q76 32 113 33 Q157 28 163 85 Q141 72 129 55 Q111 83 77 90 Z':
      'M76 76 Q76 32 112 28 Q153 23 164 75 L148 66 L132 49 L107 64 L83 71 Z';
    var eyes=faceless?'<ellipse cx="120" cy="100" rx="25" ry="36" fill="#0b0d10" opacity=".86"/>':
      '<ellipse cx="101" cy="'+(headY+21)+'" rx="3.1" ry="2.7" fill="'+eye+'"/><ellipse cx="138" cy="'+(headY+21)+'" rx="3.1" ry="2.7" fill="'+eye+'"/><path d="M112 '+(headY+46)+' Q120 '+(headY+51)+' 128 '+(headY+46)+'" stroke="#684c45" stroke-width="2" fill="none"/>';
    var hat=item.person==='huy'?'<path d="M74 70 Q120 28 165 70 Z" fill="#f3b34c"/><path d="M65 72 L176 72" stroke="#e9bd64" stroke-width="10"/>':'';
    var badge=item.person==='minh'?'<rect x="145" y="187" width="17" height="22" rx="2" fill="#ddd6b3"/><path d="M153 176 V188" stroke="#b2b6b6" stroke-width="3"/>':'';
    var toy=item.person==='an'?'<circle cx="174" cy="230" r="19" fill="#a67c54"/><circle cx="161" cy="216" r="8" fill="#a67c54"/><circle cx="187" cy="215" r="8" fill="#a67c54"/><circle cx="168" cy="230" r="2" fill="#1f2124"/><circle cx="181" cy="230" r="2" fill="#1f2124"/>':'';
    return '<svg viewBox="0 0 240 310" role="img" aria-label="Hình nhân vật '+escapeHTML(p.name)+'" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="coat" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+p.coat+'"/><stop offset="1" stop-color="#202b30"/></linearGradient><radialGradient id="skin"><stop stop-color="'+face+'"/><stop offset="1" stop-color="#806c5d"/></radialGradient></defs><ellipse cx="120" cy="306" rx="70" ry="6" fill="#000" opacity=".4"/><path d="M82 '+bodyTop+' Q53 '+(bodyTop+5)+' 44 215 L30 299 L208 299 L193 215 Q186 '+(bodyTop+5)+' 156 '+bodyTop+' Z" fill="url(#coat)" stroke="#1d292d" stroke-width="4"/><path d="M110 147 L120 221 L130 147" fill="none" stroke="#ddd4c6" stroke-width="8" opacity=".45"/><rect x="111" y="132" width="19" height="29" rx="8" fill="'+face+'"/><ellipse cx="120" cy="'+(headY+14)+'" rx="'+(child?38:42)+'" ry="52" fill="url(#skin)"/><path d="'+hairPath+'" fill="'+p.hair+'"/>'+hat+eyes+badge+toy+'<path d="M65 200 L45 282 M175 200 L195 282" stroke="#29333a" stroke-width="17" opacity=".9"/><path d="M118 162 L120 287" stroke="#c9bc9d" stroke-width="2" opacity=".5"/><ellipse cx="119" cy="202" rx="1.8" ry="2" fill="#d8bfa3"/><ellipse cx="119" cy="236" rx="1.8" ry="2" fill="#d8bfa3"/></svg>';
  }
  $$('.tab').forEach(function(b){b.addEventListener('click',function(){if(!state||overlay.classList.contains('visible'))return;selectDossierTab(b.dataset.tab)})});
  $$('.inspection-button').forEach(function(b){b.addEventListener('click',function(){inspect(b.dataset.inspect)})});
  $('#admit-btn').addEventListener('click',function(){decide('admit')});
  $('#deny-btn').addEventListener('click',function(){decide('deny')});
  $('#sound-toggle').addEventListener('click',toggleSound);
  document.addEventListener('keydown',function(ev){
    if(overlay.classList.contains('visible')){
      if(ev.key==='Tab'){
        var buttons=Array.prototype.slice.call(overlayCard.querySelectorAll('button:not(:disabled)'));
        var first=buttons[0],last=buttons[buttons.length-1];
        if(!first){ev.preventDefault();overlay.focus()}
        else if(!overlayCard.contains(document.activeElement)||(ev.shiftKey&&document.activeElement===first)||(!ev.shiftKey&&document.activeElement===last)){
          ev.preventDefault();(ev.shiftKey?last:first).focus();
        }
      }
      return;
    }
    if(!state||ev.altKey||ev.ctrlKey||ev.metaKey||ev.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(ev.target.closest('[role="tab"]')&&['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){
      ev.preventDefault();
      var tabs=$$('.tab'),index=tabs.indexOf(ev.target.closest('[role="tab"]'));
      var next=ev.key==='Home'?0:ev.key==='End'?tabs.length-1:(index+(ev.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      selectDossierTab(tabs[next].dataset.tab);tabs[next].focus();return;
    }
    if(ev.key==='ArrowLeft'){ev.preventDefault();decide('deny')}
    if(ev.key==='ArrowRight'){ev.preventDefault();decide('admit')}
    if(['1','2','3'].includes(ev.key)){inspect({1:'registry',2:'camera',3:'log'}[ev.key])}
  });
  updateSoundControls();
  showIntro();
  platform.attach({
    notify:toast,
    save:function(){if(state&&!endingShown)save()},
    pause:function(){
      if(state&&!endingShown)save();
      platformPaused=true;overlay.inert=true;setBackgroundInert(true);audio.setPaused(true);
    },
    resume:function(){
      platformPaused=false;overlay.inert=false;
      var modal=overlay.classList.contains('visible');
      setBackgroundInert(modal);audio.setPaused(false);
      var focus=modal?overlayCard.querySelector('button'):$('#visitor-name');
      if(focus)focus.focus({preventScroll:true});
    }
  });
})();
