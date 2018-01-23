$(document).ready(function(){
    var socket = io();
    var usersList = $('#users');
    var messages = $('#messages');
    var feedback = $('#feedback');
    var join_modal = $("#join-chat-modal");
    join_modal.modal('show');
    var mainWrapper = $(".chat-wrapper");

    function create_modal(chat_id, username) {
        var modal = `
                <div class="modal fade" id="chat-modal-${chat_id}">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h4 class="modal-title">Messages</h4>
                        </div>
                        <div class="modal-body">

                            <ul class="messages"></ul>
                            <p class="feedback"></p>

                            <div class="form-group">
                                <input type="text" class="form-control" id="m-${chat_id}" autocomplete="off" placeholder="Enter Message"/>
                            </div>

                        </div>
                        <div class="modal-footer">
                            <!-- <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> -->
                            <button type="button" 
                            class="btn btn-primary sendMsg" 
                            data-receiver-id="${chat_id}" data-receiver-name="${username}">send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainWrapper.append(modal);
    }

    $("#join-btn").click(function() {
        var chat_username = $("#chat-username");
        console.log(socket.id);
        socket.emit('join chat', {
            username : chat_username.val(),
            chat_id : socket.id
        });

        join_modal.modal('hide');
    });

    socket.on('users', function(users){
        var userListHtml = '';
        $.each(users, function(key, val){
            userListHtml += `<li class="user">
               <a class="user-link" href="javascript:void(0)" data-chat-id="${val.chat_id}" data-username="${val.username}"> ${val.username}</a>
            </li>`;
        });

        usersList.html(userListHtml);
    });


    usersList.on('click', '.user-link', function (e) {
        var chat_id = $(this).data('chat-id');
        var username = $(this).data('username');

        console.log(chat_id + '@@' + username);
        create_modal(chat_id, username);

        mainWrapper.find('#chat-modal-' + chat_id).modal('show');

    });

    mainWrapper.on('click', '.sendMsg', function(e){
        
        var receiver_id = $(this).data('receiver-id');
        var receiver_name = $(this).data('receiver-name');
        var msg = $("#m-" + receiver_id).val();
        alert(receiver_name + "@@" + msg)
        socket.emit("chat", {
            receiver_id: receiver_id,
            receiver_name: receiver_name,
            msg: msg
        });
    });


    $('#m').keyup(function (e) {
        var user = $("#user");

        socket.emit("typing", {
            user: user.val()
        });
    });

    socket.on('chat', function(data){
        var chat_modal = $('.chat-wrapper #chat-modal-' + data.receiver_id);
        //alert($('.chat-wrapper #chat-modal-' + data.receiver_id).length);
        //feedback.val("");
        if (chat_modal.length == 0){
            create_modal(data.receiver_id, data.sender);
            mainWrapper.find('#chat-modal-' + data.receiver_id).modal('show');
        }
       var messageHtml =
           `<li class='pull-${data.align}'> ${data.sender} - ${data.msg} </li>`
        $('.chat-wrapper #chat-modal-' + data.receiver_id + ' .messages').append(messageHtml);
    })

    socket.on('typing', function (user) {
        feedback.html(user.user + " is typing...");
    })

});