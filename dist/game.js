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
    linh:{name:'LINH (?)',unit:'Phòng bảo vệ',floor:0,role:'Nhân viên trực ca đêm',skin:'#bb997d',hair:'#2b292a',coat:'#44575a',gender:'woman'}
  };
  var residents=[
    ['Nguyễn Mai','803','Đang cư trú'],['Lê Hoàng Minh','602','Đang cư trú'],
    ['Hoàng Thu Hạnh','Văn phòng BQL','Quản lý'],['Trần Quốc Huy','Khách giao hàng','Phải được xác nhận'],
    ['Bé An','Không tìm thấy','—'],['Ông Bảy','Nhân viên cũ','Nghỉ từ 2013']
  ];
  // Keys: c = camera, r = registry, l = elevator log. Each case offers 2 investigations.
  var cases=[
    {id:1,night:1,person:'mai',floor:8,quote:'Tôi vừa tan ca. Làm ơn cho tôi lên căn 803, tối nay mệt quá.',note:'Áo khoác ướt mưa. Cô vuốt nước khỏi chiếc túi xách, chờ bạn kiểm tra.',safe:true,
     r:'Nguyễn Mai — căn 803, cư dân đang hoạt động. Chữ ký nhận thư sáng nay khớp hồ sơ. Ghi chú của cô: nếu loa gọi một tên lạ, đừng trả lời thay người đó.',
     c:'01:08 — Mai bước qua cửa chính từ ngoài mưa. Camera cửa và kính phản chiếu cùng ghi một người. Cô nói với lễ tân đúng câu bạn vừa nghe; thiết bị tự lưu đoạn âm thanh.',
     l:'Thẻ 803 rời tầng 8 lúc 18:42 và vừa trở lại sảnh. Không có chuyến trùng lặp. Ở cuối trang log, một dòng không có tên hành khách nhấp nháy rồi mất.',
     outcome:'Mai bước vào: “Ca trước cũng có người tên Linh. Chắc trùng tên thôi.” Chuông tầng 8 vang lên. Bạn nhìn thẻ áo của mình; không nhớ ai đã đưa nó cho bạn.',
     wrong:'Mai ngồi xuống gọi ban quản lý rồi lên bằng cầu thang bộ. Trước khi đi, cô nói: “Cậu nên hỏi xem người trực trước đã về nhà chưa.” Camera vẫn ghi nhận một người sống rời sảnh.'},
    {id:2,night:1,person:'huy',floor:11,quote:'Giao đồ ăn cho phòng 1102. Khách bảo để ngoài cửa thôi chị.',note:'Mũ bảo hiểm có vết xước mới. Túi hàng còn niêm phong của quán.',safe:true,
     r:'Trần Quốc Huy không phải cư dân. Đơn #D-719 có xác nhận trực tiếp từ 1102 lúc 01:09 bằng số điện thoại trong sổ. Lễ tân đã đối chiếu tên quán và tiền hàng.',
     c:'Huy dựng xe ở cửa chính, tháo găng tay rồi mang túi có logo quán vào sảnh. Hình ảnh khớp camera bãi xe. Nhãn giao hàng ghi #D-719, không phải một thẻ cư dân.',
     l:'Yêu cầu nhận đồ #D-719 vừa được tạo từ 1102; mã đơn chỉ có hiệu lực đêm này. Hệ thống chưa ghi giao thành công. Không có yêu cầu thay sơ đồ tầng hoặc xóa nhật ký.',
     outcome:'Huy lên tầng 11. Khách 1102 gọi xuống xác nhận đã nhận đồ, mã #D-719 được đóng. Khi cabin trở lại, loa lặp từ cuối câu cảm ơn của Huy dù anh đã ra ngoài.',
     wrong:'Huy gọi khách ngay trước camera rồi mang hàng quay về quán. Đơn #D-719 được đánh dấu giao thất bại, không có xác nhận nhận đồ. Loa thang máy vẫn lưu nguyên giọng anh.'},
    {id:3,night:1,person:'bay',floor:3,quote:'Cho tôi lên tủ bảo trì tầng ba. Có hai cầu dao, Linh à. Đừng để một giọng nói chọn hộ cậu lần nữa.',note:'Đồng phục bảo vệ kiểu cũ. Ông giữ chặt chùm chìa khóa, không yêu cầu mở tầng 13.',safe:true,evidenceKey:'l',
     r:'Ông Bảy — bảo vệ phụ trách tủ bảo trì tầng 3. Hồ sơ nhân sự ngừng năm 2013, cùng ngày cabin số 1 gặp nạn. Phần lý do nghỉ việc bị phủ một lớp mực đen.',
     c:'Camera lưu trữ 2013 có Ông Bảy dìu một người về phía cửa cứu hộ. Người trước mặt mang đúng vết rách trên tay áo. Ông chỉ vào tủ điện, không đòi sửa log hay cấp thẻ mới.',
     l:'Phiếu bảo trì 2013: nguồn chính cấp động cơ; nguồn phụ giữ đèn và chốt cửa cứu hộ. “Dừng động cơ thì ngắt nguồn chính. Đang cứu người phải giữ nguồn phụ.” Dòng ký duyệt bị xóa, chỉ còn chữ L.',
     outcome:'Bảy vào thang lên tủ bảo trì: “Không phải người chết nào cũng muốn hại cậu. Có những người chỉ đang tìm đường về.” Ông vẫn mang chìa khóa theo; tiếng kim loại dừng lại ở tầng 3.',
     wrong:'Bảy khép bàn tay, mang chùm chìa khóa quay về cầu thang. “Ta sẽ tìm cách khác.” Ông không để lại chìa khóa trên quầy. Đèn nguồn phụ vẫn sáng, không có sự cố mới.'},
    {id:4,night:1,person:'minh',floor:6,quote:'Tôi là Minh, IT tầng 6. Mở nhanh giúp tôi. Đừng ghi lượt này, hệ thống đang lỗi mà.',note:'Thẻ IT đúng tên. Anh không nhìn vào camera, chỉ nhìn nút cho phép.',safe:false,evidenceKey:'l',spooky:true,
     r:'Lê Hoàng Minh, căn 602 — thẻ còn hiệu lực. Chân dung và mã nhân viên đều khớp. Quyền IT không cho phép miễn ghi lịch sử vào cabin; không có phiếu sửa chữa cho lượt này.',
     c:'Người trước mặt dùng đúng giọng trong đoạn lễ tân lưu tuần trước. Hình anh không phản chiếu trên kính trong khi đèn vẫn sáng; đầu đọc nhận lại cùng một khung hình ba lần.',
     l:'01:02 — Minh thật lên tầng 6; điện thoại nội bộ tại 602 xác nhận anh chưa đi xuống. 01:11 — thẻ Minh xuất hiện lần nữa tại sảnh. Lượt thứ hai đề nghị bỏ ghi log, trái quy trình.',
     outcome:'Bạn giữ cửa khóa. Nụ cười của Minh dừng hẳn, nhưng giọng nói vẫn tiếp tục: “Đừng ghi lượt này.” Một dòng trống thử chen vào nhật ký rồi bị hệ thống từ chối.',
     wrong:'Bản sao vào cabin. Loa ở tầng 6 lập tức gọi tên bạn bằng giọng Minh. Một quyền truy cập không có người sở hữu đã lọt vào hệ thống; nó chưa có quyền rời tòa nhà.'},
    {id:5,night:2,person:'minh',floor:6,quote:'Hai lượt quẹt cùng thẻ, nhưng tôi chỉ thực hiện một lượt. Tôi có phiếu sửa chữa. Cứ gọi lên 602 kiểm tra trước đi.',note:'Mang túi dụng cụ và phiếu có chữ ký lễ tân. Anh chờ bạn xác minh.',safe:true,evidenceKey:'l',
     r:'Phiếu #IT-206 được lễ tân lập lúc 00:50 đêm thứ hai, trước giờ hiện tại. Minh được gọi kiểm tra rơ-le và đường intercom. Số nội bộ 602 xác nhận lịch; phiếu không yêu cầu xóa dữ liệu.',
     c:'Minh đi từ bãi xe qua hai camera có dấu thời gian hiện tại. Tay áo và túi dụng cụ khớp phiếu. Anh tự đặt thẻ trước ống kính, không yêu cầu bạn bỏ qua bước nào.',
     l:'Biên bản an ninh: thẻ Minh xuất hiện hai lần đêm đầu, bản sao đã bị từ chối. Phiếu chẩn đoán lưu sẵn: năm 2013, rơ-le thay sai làm cabin dừng ở chiếu nghỉ bảo trì 13. Một lệnh ngắt nguồn phụ đến từ đường intercom, không có tài khoản duyệt.',
     outcome:'Minh vào kiểm tra rồi gửi bản sao chẩn đoán: “Nguồn phụ không kéo cabin. Nó giữ cửa cứu hộ. Ai bảo cậu tắt cả hai là đang nói dối.” Anh giữ nguyên log và đánh dấu rơ-le cần thay.',
     wrong:'Minh thu túi dụng cụ: “Phiếu chẩn đoán đã nằm trong máy trực, nhưng tôi không vào được thì không sửa được rơ-le.” Anh rời sảnh, không trao bản sao hay dụng cụ. Lỗi phần cứng chưa được xử lý.'},
    {id:6,night:2,person:'an',floor:9,quote:'Cô Linh ơi, cho cháu về tầng chín. Mẹ dặn đứng ở chỗ cũ, đừng đi theo ai gọi cháu bằng tên khác.',note:'Chân trần, ôm con gấu bông. Bé đọc tên bạn trước khi nhìn thẻ áo.',safe:true,evidenceKey:'r',
     r:'An, 7 tuổi — từng ở căn 904 với mẹ là Vân. Phụ lục cứu hộ 2013 ghi hai mẹ con mắc trong cabin số 1; báo cáo chính lại ghi cabin trống. Tên An và Vân bị gạch khỏi danh sách, không có xác nhận đã ra ngoài.',
     c:'Bóng một phụ nữ quỳ xuống chỉnh áo cho An trong đoạn lưu 2013. Bé hiện tại chỉ về tầng 9, nơi hai mẹ con bắt đầu chuyến đi. Không có hình ảnh bé đòi thẻ mới hoặc xin đổi tên trong sổ.',
     l:'Yêu cầu từ căn 904 dừng ở 01:13 năm 2013. Điểm mắc cabin thực tế là chiếu nghỉ bảo trì 13; tầng 9 chỉ là điểm xuất phát. Mục cứu hộ mang tên An vẫn chờ xác nhận, không có quyền đi ra cổng tòa nhà.',
     outcome:'An bước vào cabin: “Lần trước cô bảo sẽ quay lại.” Đèn tầng 9 sáng dịu. Một giọng phụ nữ đáp từ trong loa; An vẫn chưa gặp được mẹ, nhưng đã đến gần chuyến đi còn dang dở.',
     wrong:'An ôm con gấu quay lại chiếu nghỉ tầng 9 bằng cầu thang cũ. “Vậy cháu chờ ở đây.” Không có tiếng gào, không có ai bị hại; chỉ một dòng tên bị gạch tiếp tục đợi trong máy.'},
    {id:7,night:2,person:'stranger',floor:13,quote:'Thêm tên tôi vào chỗ trống. Chỉ một nét bút thôi, rồi tôi sẽ được đi như mọi người.',note:'Áo khoác đen ướt ở bên trong. Ông ta đưa một tấm thẻ không có tên.',safe:false,evidenceKey:'c',spooky:true,
     r:'Không có cư dân, khách được xác nhận hoặc người trong danh sách cứu hộ khớp mô tả. Sơ đồ chỉ cho phép 12 tầng dân dụng; mã bảo trì 13 không phải địa chỉ có thể đăng ký.',
     c:'Chiếc áo tự di chuyển, phía trên cổ không có khuôn mặt. Trong những khung hình bị mất, ô tên người trực bị thay bằng một vệt đen. Người lạ chỉ hiện rõ khi bạn nhìn vào ô trống ấy.',
     l:'Bản nháp 2013 có tên người cần cứu. Khi mất tín hiệu nguồn phụ, phần mềm ghi nhầm “KHÔNG CÓ AI TRONG CABIN”. Ban quản lý năm ấy duyệt bản trống, gạch tên mà chưa đối chiếu phụ lục cứu hộ. Một lượt không tên bám vào phần bị xóa, nay đòi cấp danh tính.',
     outcome:'Bạn không ghi thêm tên. Người lạ gõ móng tay lên ô trống: “Vậy tôi sẽ mượn một cái.” Giọng hắn lần lượt giống Minh, Huy rồi chính bạn.',
     wrong:'Cửa mở. Một hàng áo khoác hiện trong kính nhưng tải trọng chỉ tăng một đơn vị. Dòng hành khách không tên đã vào cabin; ô chữ ký LINH trên máy trực bắt đầu tự hoàn thành.'},
    {id:8,night:2,person:'hanh',floor:12,quote:'Tôi là quản lý. Cho tôi lên tầng 12, xóa log rồi tắt cả hai nguồn. Việc năm ấy cũng đã xử lý như thế.',note:'Tập hướng dẫn không có dấu ban quản lý. Bà ta đọc lệnh thay vì trả lời câu hỏi.',safe:false,evidenceKey:'l',spooky:true,
     r:'Hoàng Thu Hạnh đang công tác; lễ tân đã xác nhận trực tiếp qua số công vụ. Quy trình hiện hành cấm xóa log trong một sự cố đang điều tra. Không có ủy quyền vận hành nào cho người trước mặt.',
     c:'Người mang mặt Hạnh bước ra từ cabin đang trống. Âm thanh trùng từng nhịp với lệnh intercom trong băng 2013, kể cả tiếng ho ở cuối câu. Không có lượt bà đi vào từ cổng chính.',
     l:'Băng 2013: “Ngắt cả nguồn phụ” đến từ tài khoản không tồn tại, trước khi cửa cứu hộ đóng. Báo cáo cabin trống được tạo sau khi mất tín hiệu; ban quản lý năm 2013 duyệt mà chưa đối chiếu tên nạn nhân. Lệnh hiện tại muốn xóa cả phụ lục gốc và khôi phục mã 13 thành tầng dân dụng.',
     outcome:'Bạn giữ nguyên log. Bà ta đóng tập hồ sơ: “Lần trước cậu đã nghe lời.” Đường intercom phát ra giọng người lạ, rồi im. Máy trực giữ được hai phiên bản biên bản để đối chiếu.',
     wrong:'Người mang mặt Hạnh đi vào. Một phiên làm việc trái phép tìm cách ghi đè log và đổi 12 tầng thành 13. Bộ lưu chỉ đọc giữ lại bản cũ, nhưng quyền điều khiển cabin đã bị xâm nhập thêm.'},
    {id:9,night:3,person:'huy',floor:11,quote:'Đơn từ đêm đầu vẫn chưa giao được. Khách chờ tôi mà. Mã D-719, chị nhớ chứ?',note:'Mũ không còn vết xước. Túi hàng mất logo, nhãn đơn bị in ngược.',safe:false,evidenceKey:'l',spooky:true,
     r:'Mã #D-719 đã hoàn tất ở tầng 11 đêm đầu tiên; 1102 xác nhận không đặt lại. Mã đơn cũ đã hết hiệu lực. Yêu cầu hiện tại dùng số tài khoản thuộc hệ thống cư dân đã ngừng năm 2013.',
     c:'Túi hàng tự rung dù người kia đứng yên. Nhãn in ngược giống hình lấy từ kính phản chiếu, không giống ảnh giao hàng gốc. Anh ta nhắc lại câu lễ tân đã ghi, nhưng không đọc được tên quán.',
     l:'Tầng 11 đã nhận đồ từ Huy ở đêm đầu. Tài khoản gửi yêu cầu mới bị xóa từ năm 2013. Chữ ký phê duyệt đang thử lấy mẫu từ sổ trực LINH; đây không phải xác nhận mới từ 1102.',
     outcome:'Bạn giữ cửa. Người kia kéo khóa túi; bên trong chỉ có tiếng của Huy bị phát lặp. “Đã nhận, chưa nhận... có khác gì nhau?” Thẻ giả bị giữ ngoài cabin.',
     wrong:'Người giả Huy vào thang. Tầng 11 không nhận cuộc gọi; ở đầu kia chỉ có giọng bạn đọc tên mình. Thực thể đã lấy thêm một lượt thông hành nội bộ.'},
    {id:10,night:3,person:'mai',floor:8,quote:'Tôi vừa tan ca. Làm ơn cho tôi lên căn 803, tối nay mệt quá.',note:'Từng giọt nước rơi đúng chỗ trên sàn như đêm đầu, dù ngoài trời đã tạnh.',safe:false,evidenceKey:'c',spooky:true,
     r:'Mai đang ở căn 803. Cuộc gọi hình từ số lưu trong sổ cho thấy cô ở nhà, không có lượt rời tòa nhà đêm này. Người ở sảnh không trả lời khi được hỏi ai đang cầm máy ở trên.',
     c:'Người trước mặt lặp chính xác tư thế và chuyển động môi trong video đêm đầu. Vệt nước cũng lặp lại. Dấu thời gian của hình đã cũ; camera cửa chính hiện tại không ghi nhận ai vừa tới.',
     l:'01:08 đêm đầu: có một lượt lên tầng 8 sau khi Mai được cho vào. Thẻ hiện tại sao chép nguyên dấu thời gian ấy. Không có yêu cầu mới nào từ căn 803.',
     outcome:'Bạn từ chối. “Mai” bật thành tiếng rè, lặp đi lặp lại câu đầu tiên rồi mất hình. Từ điện thoại nội bộ, Mai thật hỏi: “Linh ơi, ai đang nói bằng giọng tôi?”',
     wrong:'Bản sao vào cabin. Mai thật gọi từ 803, vẫn đang ở nhà. Giọng cô trên điện thoại và giọng trong thang cùng đọc một câu; chỉ giọng trong thang tiếp tục khi bạn ngắt máy.'},
    {id:11,night:3,person:'bay',floor:3,quote:'Tầng mười ba chỉ là chiếu nghỉ bảo trì. Người ta xóa nó khỏi bản vẽ, nhưng không vì thế mà chúng ta đã ra khỏi cabin.',note:'Ông xin lên tủ điều khiển tầng 3. Chìa khóa có cùng vết mẻ từ đêm đầu.',safe:true,evidenceKey:'l',
     r:'Phụ lục cứu hộ 2013 có Bảy, An, Vân và một nhân viên trực tên Linh. Bảy vào cabin trước khi nguồn phụ bị ngắt; Linh rời bàn để tìm họ. Không người nào ký xác nhận đã trở ra. Báo cáo cabin trống không khớp danh sách này.',
     c:'Bảy đứng ở cửa cứu hộ trong đoạn băng cũ. Ông giữ cửa cho một phụ nữ ôm con, không cố chen ra trước. Người hiện tại chỉ về tủ điều khiển, muốn giữ tên người mất tích và nguồn phụ, không yêu cầu quyền ra ngoài.',
     l:'Quy trình khôi phục: ngắt nguồn chính để khóa động cơ; giữ nguồn phụ để chốt cứu hộ hoạt động; mở cửa thủ công ở chiếu nghỉ 13. Chìa khóa mở tủ thuận tiện hơn, nhưng cần cơ học dưới nắp bàn trực vẫn dùng được. Chỉ tên đối chiếu đúng danh sách cứu hộ mới được xác nhận ra ngoài.',
     outcome:'Bảy đặt chìa khóa phòng máy vào tay bạn trước khi vào thang. “Ta không cứu kịp họ. Cậu đã quay vào tìm, rồi không ai ghi tên cậu nữa.” Ông chờ ở tủ tầng 3, để lựa chọn cuối cùng cho bạn.',
     wrong:'Ông gật đầu buồn bã. Chiếc chìa khóa biến mất trong tay. “Cần cứu hộ còn dưới nắp bàn. Nếu không tin ta, hãy tin những tên người đã bị xóa.” Ông đi về chiếu nghỉ cũ, không trao chìa khóa.'},
    {id:12,night:3,person:'linh',floor:0,quote:'Cho tôi về bàn trực G. Tôi không xin ra khỏi tòa nhà, cũng không cần tên mới. Tôi chỉ muốn cậu nhớ vì sao mình đã rời chiếc ghế ấy.',note:'Mặc đồng phục của bạn, nhưng tay áo ám khói. Cô đặt thẻ xuống, để trống ô cấp quyền ra ngoài.',safe:true,evidenceKey:'c',
     r:'Hồ sơ 2013: Linh, nhân viên trực cabin số 1, mất tích khi quay vào cứu người. Bản phân ca hiện tại dùng lại chữ ký cũ; trùng chữ ký không đủ xác minh. Yêu cầu này chỉ xin trở về bàn G bằng tên gốc, không đổi log hoặc cấp quyền rời tòa nhà.',
     c:'Camera sảnh không có một người mới đi vào. Camera bàn trực lại phát đoạn 2013: Linh đứng dậy đi cứu hộ, để lại một khoảng trống ở chiếc ghế bạn đang ngồi. Người trước mặt chỉ về khoảng trống ấy; ô xác nhận ra ngoài trên thẻ cô vẫn để trắng.',
     l:'Hai dấu vết cùng mang tên Linh: người ở lại nghe intercom, và người quay vào tìm An. Cả hai nối với cùng ca cứu hộ 2013, không phải hành trình nhập cảnh mới. Yêu cầu G chỉ hợp nhất ký ức tại bàn trực; giữ nguyên sổ tên và khóa cửa ra ngoài.',
     outcome:'Bạn cho cô trở về bàn trực. Không có thêm hành khách bước vào; vết khói hiện trên tay áo của chính bạn. Bạn nhớ mình đã đi tìm An sau khi nhận ra giọng nói trong loa không thuộc ban quản lý.',
     wrong:'Bạn khóa lối về bàn G. Cô khẽ nói: “Tôi vẫn là phần cậu đã để lại trong cabin.” Bóng cô lùi khỏi màn hình; không ai trao mảnh giấy nào. Một đoạn ký ức cứu hộ còn bị giữ riêng.'}
  ];
  var scenes=[
    {name:'CA TRỰC THỨ NHẤT',subtitle:'Tên người trực',body:'Bạn tỉnh trước bàn điều khiển, chiếc áo đã có thẻ LINH. Không nhớ đường đến Vesper Tower, chỉ nhớ lời dặn: tòa nhà có 12 tầng và không mở cửa cho người chưa xác minh. Ngoài sảnh, mưa vẫn rơi. Trên giấy bàn giao có đúng nét chữ của bạn, nhưng năm ở góc giấy là 2013.',line:'“Đừng tin một dấu hiệu. Hãy so sánh ít nhất hai nguồn. Ai xin bỏ ghi tên thì phải kiểm tra lại hành trình.”'},
    {name:'CA TRỰC THỨ HAI',subtitle:'Hai bản biên bản',body:'Ngoài sảnh là một đêm mới, nhưng đồng hồ bàn trực lại quay về 01:13. Máy tự mở một phiếu chẩn đoán từ kho lưu trữ. Cùng sự cố năm 2013 có hai báo cáo: một danh sách cần cứu hộ và một biên bản khẳng định cabin trống. Các tên trong bản đầu đã bị gạch.',line:'“Người chết có thể cần được cứu. Thứ không có tên thì muốn mượn tên người khác.”'},
    {name:'CA TRỰC CUỐI CÙNG',subtitle:'Chỗ trống mang tên bạn',body:'Đêm thứ ba bắt đầu; đồng hồ lại ở 01:13. Những danh tính đã qua sảnh đang bị gọi lại bằng các đoạn ghi cũ. Nút 13 là mã chiếu nghỉ bảo trì bị xóa khỏi sơ đồ, không phải một tầng cư dân. Dưới lớp giấy phân ca, bạn thấy một dòng: LINH — CHƯA XÁC NHẬN TRỞ VỀ.',line:'“Cửa cabin chỉ cho chúng vào hệ thống. Cửa cuối cùng mới cho chúng mượn một cái tên để đi ra ngoài.”'}
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
  var state=null,tab='registry',muted=readStorage(SOUND_KEY)==='off',audioContext=null,toastTimer=null;
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
  function button(label,handler,secondary){var b=document.createElement('button');b.className=secondary?'secondary-cta':'main-cta';b.textContent=label;b.addEventListener('click',handler);return b}
  function addButtons(items){var wrap=document.createElement('div');wrap.className='cta-row';items.forEach(function(item){wrap.appendChild(button(item[0],item[1],item[2]))});overlayCard.appendChild(wrap);wrap.querySelector('button').focus({preventScroll:true})}
  function sound(type){if(muted)return;try{audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();var o=audioContext.createOscillator(),g=audioContext.createGain(),now=audioContext.currentTime;o.connect(g);g.connect(audioContext.destination);o.type=type==='bad'?'sawtooth':'sine';o.frequency.setValueAtTime(type==='bad'?132:type==='scan'?760:type==='door'?220:450,now);o.frequency.exponentialRampToValueAtTime(type==='bad'?54:type==='door'?150:320,now+.2);g.gain.setValueAtTime(.045,now);g.gain.exponentialRampToValueAtTime(.0001,now+.29);o.start();o.stop(now+.3)}catch(e){}}
  function toast(msg){var el=$('#toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('visible')},2400)}
  function showIntro(){
    $('#game-shell').hidden=true;$('#game-footer').hidden=true;
    var b=best(),hasSave=!!load();
    uiOverlay('<div class="intro-kicker">VESPER TOWER · INCIDENT FILE 013</div><h1 class="hero-title">THE LAST<br><span>ELEVATOR.</span></h1><p class="lead">01:13 sáng. Tòa nhà chỉ có 12 tầng. Một người vừa bấm số 13.<br>Thẻ trên ngực ghi LINH. Sổ trực cũng có tên bạn, lặp lại từ năm 2013. Ba đêm tới, bạn phải xác minh từng người trước cửa — rồi tìm xem ai đã xóa tên những người chưa từng trở về.</p><div class="quote">KIỂM TRA. SUY LUẬN. QUYẾT ĐỊNH.<br>Đừng để một cái tên đúng che mất một hành trình sai.</div><div class="intro-stats"><div><span>CA TRỰC</span><strong>03 NIGHTS</strong></div><div><span>HÀNH KHÁCH</span><strong>12 CASES</strong></div><div><span>ĐIỂM CAO NHẤT</span><strong>'+String(b.score).padStart(4,'0')+'</strong></div></div><p class="lead" style="font-size:12px">Khuyến nghị bật âm thanh, nhưng game có thể chơi hoàn toàn không cần tiếng.</p>');
    addButtons(hasSave?[['TIẾP TỤC CA TRỰC →',function(){state=load();startCase()},false],['CA MỚI',startNew,true]]:[['BẮT ĐẦU CA TRỰC →',startNew,false]]);
  }
  function startNew(){state=fresh();save();showNightIntro(1)}
  function showNightIntro(n){
    var s=scenes[n-1];
    uiOverlay('<span class="scene-label">VESPER TOWER / NIGHT 0'+n+' · '+s.subtitle+'</span><h2>'+s.name+'</h2><p class="lead">'+escapeHTML(nightBody(n))+'</p><div class="quote">'+s.line+'</div><div class="instruction-list"><div class="instruction-item"><b>QUY TẮC 01.</b> Tối đa 2 nguồn xác minh khác nhau; có thể đọc lại nguồn đã mở.</div><div class="instruction-item"><b>QUY TẮC 02.</b> Đối chiếu hồ sơ với hành trình và yêu cầu thực tế. Từ chối nhầm làm giảm độ tin cậy.</div><div class="instruction-item"><b>QUY TẮC 03.</b> Không phải người đã chết nào cũng nguy hiểm. Đừng cấp tên mới hoặc xóa log theo lời hành khách.</div></div>');
    addButtons([['BẮT ĐẦU NIGHT 0'+n+' →',startCase,false]]);
  }
  function nightOf(i){return i<4?1:i<8?2:3}
  function startCase(){
    if(!state)return showIntro();
    if(state.i>=cases.length)return showFinale();
    tab='registry';
    $('#game-shell').hidden=false;$('#game-footer').hidden=false;
    render();hideOverlay();save();
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
      '<div class="rule-entry"><b>04 /</b> Không bắt buộc từ chối người đã chết; hãy phân biệt ý định của họ.</div>'+
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
  function caseQuote(item){
    if(item.id===9&&!wasAdmitted(2))return 'Đơn từ đêm đầu bị chị từ chối, nên tôi quay lại. Vẫn mã D-719. Lần này cứ cho qua, khỏi gọi khách.';
    return item.quote;
  }
  function caseNote(item){
    if(item.id===11&&!wasAdmitted(3))return 'Bảy trở lại sau lần bị từ chối ở đêm đầu. Chùm chìa khóa vẫn ở tay ông; chưa có chiếc nào được trao cho bạn.';
    return item.note;
  }
  function nightBody(n){
    var body=scenes[n-1].body;
    if(n===2)body+=' Lượt mang thẻ Minh thứ hai '+(wasAdmitted(4)?'đã được cho vào; một quyền lạ còn nằm trong cabin.':'đã bị từ chối; chữ ký người trực vẫn chưa bị thay.');
    return body;
  }
  function nightSummaryText(done){
    if(done===1){
      var minh=wasAdmitted(4)?'Bạn đã cho bản sao Minh vào cabin. Một dòng trống theo nó đi lên, nhưng khóa cổng ngoài chưa mở.':'Bạn đã giữ bản sao Minh ngoài cabin. Nó vẫn nói qua intercom, như thể đã ở trong đường dây từ trước.';
      return minh+' Tiếng chim sáng lên ngoài sảnh; đồng hồ bàn trực không qua được 01:13. Dưới tờ phân ca xuất hiện một con số: 2013. Ngày ngoài kia đã đổi, còn ca của bạn thì chưa.';
    }
    var repair=wasAdmitted(5)?'Bản chẩn đoán Minh gửi xác nhận lỗi rơ-le và hai nguồn điện riêng.':'Minh đã rời đi, không trao bản sao chẩn đoán. Phiếu cũ lưu sẵn trong máy vẫn cho thấy rơ-le cần sửa và hai nguồn điện riêng.';
    var child=wasAdmitted(6)?'An đang đợi trong chuyến cabin chưa kết thúc.':'An vẫn chờ ở chiếu nghỉ tầng 9, ôm con gấu.';
    var order=wasAdmitted(8)?'Phiên lệnh của người giả Hạnh đã vào hệ thống; bản lưu chỉ đọc còn giữ được dấu vết gốc.':'Lệnh xóa log của người giả Hạnh đã bị chặn; hai bản biên bản vẫn còn nguyên.';
    return repair+' '+child+' '+order+' Từ loa, một giọng không còn giả ai thì thầm: “Họ gọi tôi là Kẻ Đi Nhờ. Không ai ghi tên tôi, nên tôi sẽ dùng tên người trực.”';
  }
  function clueText(item,key){
    if(item.id===5&&key==='l'&&wasAdmitted(4))return 'Biên bản an ninh: thẻ Minh xuất hiện hai lần đêm đầu, bản sao đã được cho vào. Chủ thẻ thật có phiếu sửa chữa hiện tại. Chẩn đoán lưu sẵn: rơ-le thay sai gây tai nạn 2013; lệnh ngắt nguồn phụ đến từ intercom, không có tài khoản duyệt. Quyền lạ trong cabin cần được hủy trước khi mở cổng ngoài.';
    if(item.id===9&&!wasAdmitted(2)){
      if(key==='r')return 'Mã đơn #D-719 chưa được giao vì bị từ chối ở đêm đầu tiên. Mã đã hết hiệu lực, không có đơn mới từ 1102. Yêu cầu hiện tại dùng số tài khoản cư dân đã ngừng năm 2013; việc giao thất bại không hợp thức hóa tài khoản đó.';
      if(key==='l')return 'Tầng 11 xác nhận chưa nhận đồ từ Huy sau khi ca trực từ chối đơn #D-719. Tài khoản gửi yêu cầu mới bị xóa từ năm 2013. 1102 không gửi xác nhận mới; quyền ký duyệt đang bị sao chép từ sổ trực LINH.';
    }
    if(item.id===10&&key==='l'&&!wasAdmitted(1))return '01:08 của đêm đầu: yêu cầu lên tầng 8 đã bị từ chối. Dấu thời gian hiện tại trên thẻ từ vẫn sao chép nguyên xi bản ghi đêm đầu.';
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
    if(!state||$('#game-shell').hidden||overlay.classList.contains('visible')||!Object.prototype.hasOwnProperty.call(inspectionSources,kind))return;
    var item=cases[state.i];if(!item)return;
    if(state.opened.includes(kind)){
      // Keep the latest viewed source last so existing saves restore it after reload.
      state.opened=state.opened.filter(function(source){return source!==kind}).concat(kind);
      save();renderClue(kind);return;
    }
    if(state.opened.length>=2)return;
    state.opened.push(kind);sound('scan');
    if(item.evidenceKey===inspectionSources[kind].key&&!state.found.includes(item.id)){state.found.push(item.id);state.evidence++;state.score+=25}
    save();renderClue(kind);updateInspectionControls();
    $('#evidence-status').textContent='EVIDENCE '+String(state.evidence).padStart(2,'0');
    $('#score-status').textContent=String(Math.max(0,state.score)).padStart(4,'0')+' PTS';
    if(kind==='camera'&&item.spooky){$('#elevator-stage').classList.remove('glitch');void $('#elevator-stage').offsetWidth;$('#elevator-stage').classList.add('glitch')}
  }
  function decide(action){
    if(!state||state.i>=12||overlay.classList.contains('visible'))return;
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
    uiOverlay('<span class="scene-label">NIGHT 0'+done+' / SHIFT COMPLETE</span><h2>BẢN GHI<br>CA TRỰC</h2><p class="lead">'+escapeHTML(nightSummaryText(done))+'</p><div class="result-grid"><div class="result-item"><strong>'+state.correct+'</strong><small>ĐÚNG</small></div><div class="result-item"><strong>'+state.breach+'</strong><small>BREACH</small></div><div class="result-item"><strong>'+state.evidence+'</strong><small>EVIDENCE</small></div></div><div class="quote">'+(done===1?'“Hồ sơ có thể đúng tên, nhưng người đứng trước cửa chưa chắc đã đi đúng hành trình.”':'“Có người bị xóa tên khi người ta vội khép hồ sơ tai nạn. Có thứ chỉ đợi một cái tên bị bỏ trống.”')+'</div>');
    addButtons([['TIẾP TỤC NIGHT 0'+next+' →',function(){showNightIntro(next)},false]]);
  }
  function showFinale(){
    var memory=wasAdmitted(12)?'Ký ức vừa trở về khớp với hình người trực rời ghế.':'Bạn chưa nhận lại phần ký ức ở bàn G; đoạn băng gốc vẫn hiện lên để đối chiếu.';
    uiOverlay('<span class="scene-label">01:13 AM / FINAL TRANSMISSION</span><h2>CHUYẾN ĐI<br><span class="ending-title">CUỐI CÙNG.</span></h2><p class="lead">Cửa chiếu nghỉ 13 hiện trên màn hình, chưa mở ra ngoài. Bộ lưu chỉ đọc tự phát băng gốc: năm 2013, rơ-le sai giữ cabin lại; Bảy vào cứu An và mẹ là Vân. Một giọng giả danh quản lý bảo ngắt nguồn phụ. Cửa cứu hộ đóng. Linh rời ghế đi tìm họ. Mất tín hiệu bị phần mềm ghi nhầm thành “cabin trống”. Ban quản lý năm 2013 đã duyệt bản báo cáo và gạch cả bốn tên khi chưa đối chiếu phụ lục cứu hộ.</p><p class="lead">'+escapeHTML(memory)+' Kẻ Đi Nhờ đã có trong đường dây trước tai nạn; bản báo cáo sai cho nó chỗ trống để chiếm danh tính. Cho bản sao vào cabin chỉ đưa nó tới hệ thống. Cửa này mới là nơi một tên trong sổ được phép rời tòa nhà.</p><div class="quote">Bên trong nắp bàn trực có khắc: “Ngắt nguồn chính để khóa động cơ. Giữ nguồn phụ. Kéo cần mở cửa cứu hộ bằng tay.” Bên dưới là bốn tên chưa được xác nhận trở về: BẢY · AN · VÂN · LINH.</div><p class="lead">Khóa tầng 13 sẽ giữ thứ ấy lại, cùng những người mắc kẹt. Cắt cả hai nguồn sẽ đóng luôn cửa cứu hộ. Muốn mở cửa an toàn, bạn phải có đủ bằng chứng đối chiếu tên thật, còn được tin cậy và giữ quyền lạ trong cabin ở mức có thể kiểm soát.</p><p class="lead">Bằng chứng thu thập: <strong>'+state.evidence+'</strong> · Độ tin cậy: <strong>'+state.trust+'</strong> · Thực thể lọt qua: <strong>'+state.breach+'</strong></p><p class="lead" style="font-size:12px">Tên bạn có trong danh sách. Nhưng người bước ra có còn là bạn không?</p>');
    addButtons([['KHÓA TẦNG 13',function(){showEnding('keeper')},true],['MỞ CỬA TẦNG 13',function(){showEnding(state.evidence>=4&&state.trust>=4&&state.breach<=1?'truth':'replacement')},false],['CẮT NGUỒN ĐIỆN',function(){showEnding('silence')},true]]);
  }
  var endings={
    keeper:{title:'THE KEEPER',subtitle:'Bạn giữ cửa. Và ở lại phía bên này.',text:'Bạn khóa liên động chiếu nghỉ 13, giữ nguồn phụ sáng. Kẻ Đi Nhờ không thể mang tên Linh ra cổng ngoài. Ở sảnh thật, Mai và những cư dân còn sống sẽ qua được một đêm không có thứ ấy đi theo. Nhưng các tên trong biên bản cứu hộ vẫn chưa được xác nhận trở về. Bạn ngồi xuống, đặt tay lên công tắc để giữ khóa. Ngoài kia trời sáng; tại bàn trực, đồng hồ trở về 01:13. Dưới dòng CA TRỰC THỨ NHẤT, tên LINH lại hiện ra.',tone:'Bạn giữ an toàn cho người còn sống. Chuyến đi của những người đã mất vẫn chưa kết thúc.'},
    replacement:{title:'THE REPLACEMENT',subtitle:'Cái tên ra ngoài. Người mang tên ở lại.',text:'Bạn mở cửa khi chưa thể đối chiếu và giữ an toàn toàn bộ danh sách. Một lượt không tên chen vào ô LINH trước khi máy kịp xác nhận. Kẻ Đi Nhờ khoác đồng phục của bạn, ký trả ca rồi bước qua cổng ngoài bằng khuôn mặt bạn. Camera sảnh ghi Linh đã về nhà. Trong phòng điều khiển, bạn vẫn đặt tay trên công tắc. Tên bạn vừa được dùng hết; khi bạn gọi vào intercom, màn hình chỉ hiện một hàng trống.',tone:'Thứ từng xin một cái tên đã có tên của bạn. Không ai còn nhận ra giọng người ở trong loa.'},
    truth:{title:'THE TRUTH',subtitle:'Ca cứu hộ cuối cùng đã có người xác nhận.',text:'Bảy đứng lại đến khi người cuối cùng qua cửa. Bản đối chiếu được lưu vào kho chỉ đọc để người sống tìm thấy: cabin không trống, và Linh đã quay vào cứu người sau khi nhận ra mệnh lệnh giả. Không phải một nhân viên mới bị bổ sung vào danh sách mất tích; tên bạn vốn ở đó từ năm 2013. Bạn khép sổ, lần đầu không ký nhận ca tiếp theo. Ở sảnh ngoài, đồng hồ đi qua 01:14.',tone:'Không ai bị bỏ lại dưới một dòng “không có người”. Lần này, ca trực thực sự kết thúc.'},
    silence:{title:'THE SILENCE',subtitle:'Bạn dừng tiếng động, không kết thúc chuyến đi.',text:'Bạn hạ cả nguồn chính lẫn nguồn phụ. Động cơ dừng; chốt cứu hộ đóng lại, đúng như đêm năm 2013. Kẻ Đi Nhờ không qua được cổng, nhưng những người mắc kẹt cũng không thể ra. Đèn cuối cùng tắt trước khi biên bản được xác nhận. Không có đêm thứ nhất quay lại, không có bình minh trong phòng trực: chu kỳ bị treo giữa một giây chưa kết thúc. Trong bóng tối, An vẫn hỏi có ai đang ở ngoài cửa không.',tone:'Tòa nhà im tiếng. Những người bên trong chưa được về.'}
  };
  function endingText(key){
    if(key!=='truth')return endings[key].text;
    var opening=wasAdmitted(11)?'Ông Bảy tra chiếc chìa khóa vào ổ cũ. Bạn ngắt nguồn chính, giữ nguồn phụ và kéo cần mở cửa thủ công. ':'Chiếc chìa khóa đã biến mất. Theo dòng khắc dưới nắp bàn trực, bạn ngắt nguồn chính, giữ nguồn phụ rồi kéo cần mở cửa thủ công ở tầng 13. ';
    var child=wasAdmitted(6)?'Từ cabin, Bé An chạy tới nắm tay mẹ ở đầu hành lang sáng đèn. ':'Từ chiếu nghỉ tầng 9, An nghe mẹ gọi đúng tên mình và bước vào hành lang cứu hộ vừa mở. Hai mẹ con nắm tay nhau. ';
    var memory=wasAdmitted(12)?'Phần ký ức đã trở về cho bạn nhớ hết chuyến cứu hộ. ':'Bạn đọc tên LINH trong bản đối chiếu; phần ký ức bị từ chối ở bàn G cuối cùng tìm được đường về khi cửa cứu hộ mở. ';
    var intruder=state.breach?'Bạn hủy lượt mượn tên đã lọt vào cabin; dấu vết không khớp danh sách bị giữ sau cửa. ':'Không có lượt giả nào trong cabin để chiếm ô tên vừa phục hồi. ';
    return 'Bạn dùng những bằng chứng đã thu thập để đối chiếu lại tên người cần cứu. Những xác nhận còn tin cậy giúp hệ thống giữ tên thật, thay vì cấp danh tính cho ô trống. '+intruder+opening+child+memory+endings.truth.text;
  }
  function showEnding(key){
    var e=endings[key];recordBest(key);
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
  $('#sound-toggle').addEventListener('click',function(){muted=!muted;writeStorage(SOUND_KEY,muted?'off':'on');this.textContent=muted?'♪̸':'♫';toast(muted?'Âm thanh đã tắt':'Âm thanh đã bật')});
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
  $('#sound-toggle').textContent=muted?'♪̸':'♫';
  showIntro();
})();
