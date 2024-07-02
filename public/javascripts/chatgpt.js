$(document).ready(function () {
    // Query box.
    $("#query").keydown(function (e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            $("#query-submit").trigger('click');
        }
    });

    // Query submit button.
    $('#query-submit').click(function (event) {
        let $chatPlaceholder = $(".message-placeholder");
        let $loader = $(".loader");
        let $query = $("#query");
        let query = $query.val();
        let assistantId = $("#assistant-id").val();

        $chatPlaceholder.append("<div class='conversation user-conversation'><span class='avatar user-avatar'></span><span class='message'>"+ query +"</span></div>");

        var settings = {
            "url": "/chatgpt/query",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "query": query,
                "assistantId": assistantId
            }),
            "beforeSend": function (jqXHR) {
                $loader.show();
                $query.prop("disabled", true);
                event.currentTarget.disabled = true;
            },
            "error": function (exception) {
                alert(exception);
            },
            "complete": function () {
                $query.val('');
                $loader.hide();
                $query.prop("disabled", false);
                event.currentTarget.disabled = false;
            }
        };

        $.ajax(settings).done(function (response) {
            let responseText = response.text;
            let citations = response.citations;

            $chatPlaceholder.append("<div class='conversation bot-conversation'><span class='avatar bot-avatar'></span><span class='message'>"+ responseText +"</span><span class='citations'>" + citations + "</span></div>");
        });
    });
});
