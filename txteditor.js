(function() {

    $.fn.txteditor = function(options) {
		
		var settings= $.extend({
		url:'upload.php'
		},options);
        var popup = $(".txteditpop");
        var popupcover = $('.txtback');
        if (popup.length <= 0)
        {
            popup = $('<div class="txteditpop"><div class="txteditclose">X</div><div class="txteditcontent"></div><div class="txtcntrlbox"></div></div>').appendTo('body');
        }
        if (popupcover.length <= 0)
        {
            popupcover = $('<div class="txtback"></div>').appendTo('body');
        }
        return this.each(function() {
            var $this = $(this).hide();
            var containerDiv = $("<div/>", {
                "class": "postingpin"
            });
            $this.after(containerDiv);
            var buttonpane = $('<div class="textformattingpd"><ul><li class="tbbold txtbutton txtedit"data-val="bold"></li><li class="tbit txtbutton txtedit"data-val="italic"></li><li class="tbud txtbutton txtedit"data-val="underline"></li><li class="tbal txtbutton txtedit"data-val="justifyleft"></li><li class="tbac txtbutton txtedit"data-val="justifycenter"></li><li class="tbarn txtbutton txtedit"data-val="justifyright"></li><li class="tbpi txtedit"data-val=""></li><li class="tbli txtedit"data-val="createlink"></li><li class="tbol txtbutton txtedit"data-val="insertorderedlist"></li><li class="tbul txtbutton txtedit"data-val="insertunorderedlist"></li></ul></div>').appendTo(containerDiv);
            var editborder = $("<div/>", {
                "class": "textareaposting"
            }).appendTo(containerDiv).get(0);
            var editor = $("<div/>", {
                "contenteditable": "true",
                "class": "postingtextbox",
                "spellcheck": "false",
                "role": "textbox"
            }).appendTo(editborder).get(0);
            $this.data('editable', editor);
            buttonpane.find('.txtbutton').on('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var contentWindow = editor;
                contentWindow.focus();
                if (e.target === this)
                {
                    document.execCommand($(this).data("val"), false, this.value || "");
                }
                else
                {
                    document.execCommand($(e.target).parent().data("val"), false, this.value || "");
                }
                contentWindow.focus();
                detect();
//                $(editor).find('div').each(function() {
//                    var outer = this.outerHTML;
//                    var regex = new RegExp('<' + this.tagName, 'i');
//                    var newTag = outer.replace(regex, '<' + 'font');
//                    regex = new RegExp('</' + this.tagName, 'i');
//                    newTag = newTag.replace(regex, '</' + 'font');
//                    $(this).replaceWith(newTag);
//                });

                return false;
            });
            var txtform;
            var txtimgcancel;
            var xhr;
            var iframe;
            buttonpane.find('.tbpi').on('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var contentWindow = editor;
                editor.focus();
                doSave(editor);
                txtform = $('<form id="txt_form" name="txt_form" enctype="multipart/form-data" method="post" action="'+settings.url+'"> <div id="txt_camera"> <i class="icon-camera"></i>Upload image </div><input type="file" name="myfile" id="txt_drop" /></form>').appendTo(popup.find('.txteditcontent').html(''));
                txtimgcancel = $('<input type="button" class="txtimgcancel" Value="Cancel" />').appendTo(popup.find('.txtcntrlbox').html(''));
                txtform.txtimgupload({
				    url: settings.url,
                    onStart: function(i, m, obj)
                    {
                        m === true ? xhr = obj : iframe = obj;
                        console.log(obj);
                    },
                    onComplete: function(i, d)
                    {
                        contentWindow.focus();
                        doRestore(editor);
                        document.execCommand('insertimage', false, d.url);
                        contentWindow.focus();
                        insertNodeAtCaret(document.createTextNode(' '));
                        popupcover.trigger('click');
                    }
                });
                popup.show();
                popupcover.show();
                detect();
                contentWindow.focus();
                return false;
            });
            var txtlink = '';
            buttonpane.find('.tbli').on('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var contentWindow = editor;
				editor.focus();
                doSave(editor);
                contentWindow.focus();
                txtlink = $('<input type="text" class="txtlink" Value="http://" />').appendTo(popup.find('.txteditcontent').html(''))
                txtimgcancel = $('<input type="button" class="txtlnkok" Value="Ok" /><input type="button" class="txtlnkcancel" Value="Cancel" />').appendTo(popup.find('.txtcntrlbox').html(''));
                popup.show();
                popupcover.show();
                contentWindow.focus();
                return false;
            });
            popup.on('click', '.txtlnkok', function() {
                var contentWindow = editor;
                var lnkval = $(txtlink).val();
                if (lnkval && lnkval !== '' && lnkval !== 'http://')
                {
                    doRestore(editor);
                    document.execCommand('createlink', false, lnkval);
                }
                popupcover.trigger('click');
                return false;
            });
            popupcover.on('click', function() {
                if (xhr)
                    xhr.abort();
                else if (iframe)
                    iframe.detachEvent();
                $(this).hide();
                popup.hide();
                editor.focus();
                doRestore(editor);
                detect();
            });
            popup.on('click', '.txtimgcancel,.txteditclose', function() {
                popupcover.trigger('click');
            });
            var tagarray = ['img', 'a'];
            var press = jQuery.Event("keyup");
            press.ctrlKey = false;
            press.which = 8;
            $(editor).keydown(function(e) {
                e = e || window.event;
                var keyCode = e.keyCode || e.which;
                if (keyCode === 9 && !e.shiftKey)
                {
                    e.preventDefault();
                    pastethehtml("<span style='margin-left: 30px;'>﻿</span>");
                }
                if (e.keyCode === 13 && !document.queryCommandState('insertorderedlist') && !document.queryCommandState('insertunorderedlist')) {
                    e.preventDefault();
                    console.log(document.queryCommandState('insertorderedlist'));
                    document.execCommand('insertHTML', false, '<br></br>');
                }
                detect();
                //return false;
            });
            $(editor).keyup(function() {
                detect();
            });
            $(editor).mouseup(function() {
                detect();
            });
            function detect()
            {
                buttonpane.find('.txtedit').css('opacity', '').removeClass('slctbt');
                if (document.queryCommandState('bold'))
                {
                    buttonpane.find('.tbbold').css('opacity', '1').addClass('slctbt').addClass('slctbt');
                }
                if (document.queryCommandState('underline'))
                {
                    buttonpane.find('.tbud').css('opacity', '1').addClass('slctbt');
                }
                if (document.queryCommandState('italic'))
                {
                    buttonpane.find('.tbit').css('opacity', '1').addClass('slctbt');
                }
                if (document.queryCommandState('justifyleft'))
                {
                    buttonpane.find('.tbal').css('opacity', '1').addClass('slctbt');
                }
                if (document.queryCommandState('justifycenter'))
                {
                    buttonpane.find('.tbac').css('opacity', '1').addClass('slctbt');
                }
                if (document.queryCommandState('justifyright'))
                {
                    buttonpane.find('.tbarn').css('opacity', '1').addClass('slctbt');
                }
                if (document.queryCommandState('insertorderedlist'))
                {
                    buttonpane.find('.tbol').css('opacity', '1').addClass('slctbt');
                }
                if (document.queryCommandState('insertunorderedlist'))
                {
                    buttonpane.find('.tbul').css('opacity', '1').addClass('slctbt');
                }
                var selection;
                var node;
                var win = 0;
                if (window.getSelection)
                {
                    selection = window.getSelection();
                    node = selection.anchorNode.parentNode;
                    win = 1;
                }
                else
                {
                    selection = document.selection.createRange();
                    if (selection.parentElement)
                    {
                        node = selection.parentElement();
                        win = 2;
                    }
                    else
                    {
                        node = selection.item(0);
                        win = 3;
                    }
                }
                if (node.className !== 'textareaposting')
                {

                    while (!node.className.match(/postingtextbox/)) {
                        var found = $.inArray(node.tagName.toLowerCase(), tagarray);
                        if (found > -1)
                        {
                            var type = node.tagName.toLowerCase();
                            switch (type)
                            {
                                case 'img':
                                    buttonpane.find('.tbpi').css('opacity', '1').addClass('slctbt');
                                    break;
                                case 'a':
                                    buttonpane.find('.tbli').css('opacity', '1').addClass('slctbt');
                                    break;
                            }
                        }
                        node = node.parentNode;
                    }
                }
            }
            function execCommand(e) {
                e.preventDefault();
                e.stopPropagation();
                var contentWindow = editor;
                contentWindow.focus();
                document.execCommand($(this).data("val"), false, this.value || "");
                contentWindow.focus();
                Endfocus(editor);
                return false;
            }
            ;
        });
        function getSelectionText() {
            var text = "";
            if (window.getSelection) {
                text = window.getSelection();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange();
            }
            return text;
        }
    };
    $.fn.htmlcode = function(content)
    {
        var txtdiv;
        var txtdata;
        if (typeof content !== 'undefined')
        {
            this.each(function() {
                txtdiv = $(this).data('editable');
                txtdiv.innerHTML = content;
                txtdata = txtdiv.innerHTML;
            });
        }
        else
        {
            txtdiv = $(this).data('editable');
            txtdata = $('<div>' + txtdiv.innerHTML + '</div>');
            txtdata.contents().filter(function() {
                return this.nodeType === 3;
            }).each(function() {
                this.nodeValue = this.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            });
            txtdata.find('div').each(function() {
                var outer = this.outerHTML;
                var regex = new RegExp('<' + this.tagName, 'i');
                var newTag = outer.replace(regex, '<' + 'p');
                regex = new RegExp('</' + this.tagName, 'i');
                newTag = newTag.replace(regex, '</' + 'p');
                $(this).replaceWith(newTag);
            });
            txtdata = txtdata.html();
        }

        return txtdata;
    };
    $.fn.txtimgupload = function(options)
    {

        var settings = $.extend({
		    url : 'upload.php',
            onStart: function(i, d) {
            },
            onComplete: function(i, d) {
            }
        }, options);
        var me = $(this);
        var completed = false;
        var bar;
        var frm;
        var xhr;
        var cncl;
        var child;
        var size = 5;
        var imgbg;
        var response;
        var iframeIdmyFile;
        var dropimg = this;
        var oldbrw = false;
        return me.each(function()
        {
            child = $(this);
            completed = false;
            size = 10;
            dropimg = this;
            oldbrw = false;
            child.on('change', '#txt_drop', function upload_myFile_file() {
                if (!isAjaxUploadSupported()) {
                    oldbrw = true;
                    var files = this;
                    var filename = files.value;
                    filename = filename.substring(filename.lastIndexOf('/') + 1);
                    if (fileExtension(filename))
                    {

                        var iframe = document.createElement("iframe");
                        iframe.setAttribute("name", "upload_iframe_myFile");
                        iframe.setAttribute("id", "upload_iframe_myFile");
                        iframe.setAttribute("width", "0");
                        iframe.setAttribute("height", "0");
                        iframe.setAttribute("border", "0");
                        iframe.setAttribute("src", "javascript:false;");
                        iframe.style.display = "none";
                        var form = document.createElement("form");
                        form.setAttribute("name", "myForm");
                        form.setAttribute("id", "myForm");
                        form.setAttribute("target", "upload_iframe_myFile");
                        form.setAttribute("action", ""+settings.url+"");
                        form.setAttribute("method", "post");
                        form.setAttribute("enctype", "multipart/form-data");
                        form.setAttribute("encoding", "multipart/form-data");
                        form.style.display = "none";
                        form.appendChild(files);
                        document.body.appendChild(form);
                        document.body.appendChild(iframe);
                        iframeIdmyFile = document.getElementById("upload_iframe_myFile");
                        settings.onStart(child, false, iframeIdmyFile);
                        var eventHandlermyFile = function() {
                            if (iframeIdmyFile.detachEvent)
                                iframeIdmyFile.detachEvent("onload", eventHandlermyFile);
                            else
                                iframeIdmyFile.removeEventListener("load", eventHandlermyFile, false);
                            response = getIframeContentJSON(iframeIdmyFile);
                            uploaded_file_myFile(response);
                        };
                        if (iframeIdmyFile.addEventListener)
                            iframeIdmyFile.addEventListener("load", eventHandlermyFile, true);
                        if (iframeIdmyFile.attachEvent)
                            iframeIdmyFile.attachEvent("onload", eventHandlermyFile);
                        form.submit();
                        var bardiv = $('<div id="txtprogressbar"><hr id="txtprogresshr"align="left"width="0%"></div>').appendTo(child.parent('.txteditcontent').html(''));
                        bar = bardiv.find('#txtprogresshr');
                        return;
                    }
                    else
                    {
                        alert('Upload only image files');
                    }
                }
                else
                {
                    frm = child.ajaxSubmit({
                        dataType: 'json',
                        beforeSubmit: function(formData, $form, options) {
                            if (!checkextension(formData[0].value))
                            {
                                // console.log(formData[0].value);
                                return false;
                            }
                            return true;
                        },
                        beforeSend: function(xhr) {
                            var percentVal = '0%';
                            var bardiv = $('<div id="txtprogressbar"><hr id="txtprogresshr"align="left"width="0%"></div>').appendTo(child.parent('.txteditcontent').html(''));
                            bar = bardiv.find('#txtprogresshr');
                            bar.width(percentVal);
                        },
                        uploadProgress: function(event, position, total, percentComplete) {
                            var percentVal = percentComplete + '%';
                            bar.width(percentVal);
                        },
                        success: function(data, message, xhr) {

                            if (xhr.responseJSON.status === "success")
                            {
                                var percentVal = '100%';
                                bar.width(percentVal);
                                settings.onComplete(child, xhr.responseJSON);
                            }
                            else
                            {
                                alert(xhr.responseJSON.message);
                            }
                        },
                        complete: function(xhr) {

                        },
                        resetForm: true

                    });
                    xhr = frm.data('jqxhr');
                    settings.onStart(child, true, xhr);
                }
            });
            child.on("drop", function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                console.log('hey');
                var files = evt.originalEvent.dataTransfer.files;
                console.log(files);
                console.log(files.length);
                if (files.length === 1)
                {

                    uploadFile(files[0]);
                }
                else
                {
                    alert("One Image allowed");
                    change_back();
                }
            });
        });
        function uploadFile(file) {

            // alert(file.name+" | "+file.size+" | "+file.type);

            if (checkextension(file))
            {
                var formdata = new FormData();
                formdata.append("myfile", file);
                xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", progressHandler, false);
                xhr.addEventListener("load", completeHandler, false);
                xhr.addEventListener("error", errorHandler, false);
                xhr.addEventListener("abort", abortHandler, false);
                xhr.open("POST", ""+settings.url+"");
                xhr.send(formdata);
            }
        }
        function progressHandler(event) {

            var bardiv = $('<div id="txtprogressbar"><hr id="txtprogresshr"align="left"width="0%"></div>').appendTo(child.parent('.txteditcontent').html(''));
            bar = bardiv.find('#txtprogresshr');
            var percent = (event.loaded / event.total) * 100;
            bar.width(Math.round(percent) + '%');
        }
        function completeHandler(event) {
            var percentVal = '100%';
            bar.width(percentVal);
            settings.onComplete(child, JSON.parse(event.target.responseText));
        }
        function errorHandler(event) {

        }
        function abortHandler(event) {

        }

        function isAjaxUploadSupported() {
            var input = document.createElement("input");
            input.type = "file";
            return (
                    "multiple" in input && typeof File !== "undefined" && typeof FormData !== "undefined" && typeof (new XMLHttpRequest()).upload !== "undefined");
        }

        function fileExtension(fileName) {
            var fileExtensions = ['jpeg', 'jpg', 'png', 'gif'];
            var ext = fileName.split('.').pop().toLowerCase();
            if (jQuery.inArray(ext, fileExtensions) < 0) {
                return false;
            }
            return true;
        }
        function checkextension(file)
        {
            var fileExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (jQuery.inArray(file.type, fileExtensions) < 0) {
                alert('Upload only image files');
                change_back();
                return false;
            }
            //console.log(file);
            var imgsize = file.size / 1048576;
            //console.log(imgsize);
            if (imgsize > size)
            {
                alert('File size limit 5Mb');
                change_back();
                return false;
            }
            return true;
        }

        function getIframeContentJSON(iframe) {

            try {

                var doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document,
                        response;
                var innerHTML = doc.body.innerHTML;
                if (innerHTML.slice(0, 5).toLowerCase() === "<pre>" && innerHTML.slice(-6).toLowerCase() === "</pre>") {
                    innerHTML = doc.body.firstChild.firstChild.nodeValue;
                }
                response = eval("(" + innerHTML + ")");
                // console.log(response);
            } catch (err) {
                response = {
                    success: false
                };
            }

            return response;
        }
        function uploaded_file_myFile(result) {
            if (result.status === "success")
            {
                completed = true;
                settings.onComplete(child, result);
            }
            else
            {
                alert(result.message);
            }

        }

    };
    var saveSelection, restoreSelection;
    saveSelection = function(containerEl) {
        if (window.getSelection && document.createRange) {
            var range = window.getSelection().getRangeAt(0);
            var preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(containerEl);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            var start = preSelectionRange.toString().length;
            return {
                start: start,
                end: start + range.toString().length
            };
        } else if (document.selection && document.body.createTextRange) {
            var selectedTextRange = document.selection.createRange();
            var preSelectionTextRange = document.body.createTextRange();
            preSelectionTextRange.moveToElementText(containerEl);
            preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
            var start = preSelectionTextRange.text.length;
            return {
                start: start,
                end: start + selectedTextRange.text.length
            };
        }
    };
    restoreSelection = function(containerEl, savedSel) {
        if (window.getSelection && document.createRange) {
            var charIndex = 0,
                    range = document.createRange();
            range.setStart(containerEl, 0);
            range.collapse(true);
            var nodeStack = [containerEl],
                    node, foundStart = false,
                    stop = false;
            while (!stop && (node = nodeStack.pop())) {
                if (node.nodeType == 3) {
                    var nextCharIndex = charIndex + node.length;
                    if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                        range.setStart(node, savedSel.start - charIndex);
                        foundStart = true;
                    }
                    if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                        range.setEnd(node, savedSel.end - charIndex);
                        stop = true;
                    }
                    charIndex = nextCharIndex;
                } else {
                    var i = node.childNodes.length;
                    while (i--) {
                        nodeStack.push(node.childNodes[i]);
                    }
                }
            }

            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (document.selection && document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(containerEl);
            textRange.collapse(true);
            textRange.moveEnd("character", savedSel.end);
            textRange.moveStart("character", savedSel.start);
            textRange.select();
        }
    };
    function doSave(el) {
        savedSelection = saveSelection(el);
    }

    function doRestore(el) {
        if (savedSelection) {
            restoreSelection(el, savedSelection);
        }
    }


    function insertNodeAtCaret(node) {
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                range.collapse(false);
                range.insertNode(node);
                range = range.cloneRange();
                range.selectNodeContents(node);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
            var html = (node.nodeType == 1) ? node.outerHTML : node.data;
            var id = "marker_" + ("" + Math.random()).slice(2);
            html += '<span id="' + id + '"></span>';
            var textRange = document.selection.createRange();
            textRange.collapse(false);
            textRange.pasteHTML(html);
            var markerSpan = document.getElementById(id);
            textRange.moveToElementText(markerSpan);
            textRange.select();
            markerSpan.parentNode.removeChild(markerSpan);
        }
    }


    function insertNodeAtCaret(node) {
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var range = sel.getRangeAt(0);
                range.collapse(false);
                range.insertNode(node);
                range = range.cloneRange();
                range.selectNodeContents(node);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
            var html = (node.nodeType == 1) ? node.outerHTML : node.data;
            var id = "marker_" + ("" + Math.random()).slice(2);
            html += '<span id="' + id + '"></span>';
            var textRange = document.selection.createRange();
            textRange.collapse(false);
            textRange.pasteHTML(html);
            var markerSpan = document.getElementById(id);
            textRange.moveToElementText(markerSpan);
            textRange.select();
            markerSpan.parentNode.removeChild(markerSpan);
        }
    }





    function pastethehtml(html) {
        var sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type != "Control") {
// IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    }


    if (!window.addEventListener) {
        window.attachEvent("drop", dropcancel);
    }
    else
    {
        window.addEventListener("dragover", change, false);
        window.addEventListener("dragleave", change_back, false);
        window.addEventListener("drop", dropcancel, false);
    }
    function dropcancel(e)
    {
        e = e || event;
        change_back();
        e.preventDefault();
    }
    function change(evt)
    {
        evt.stopPropagation();
        evt.preventDefault();
		var popup = $(".txteditpop");
		popup.css('border','2px dotted lightgrey');
		popup.find("#txt_camera").text('DROP HERE');
        console.log('drop here');
    }
    function change_back() {
		var popup = $(".txteditpop");
		popup.css('border','none');
		popup.find("#txt_camera").text('UPLOAD IMAGE');
        console.log('drop back');
    }


    $.fn.hidetxt = function()
    {
        var txtdiv;
        return this.each(function() {
            txtdiv = $(this).data('editable');
            $(txtdiv).hide();
        });
    };
    $.fn.showtxt = function()
    {
        var txtdiv;
        return this.each(function() {
            txtdiv = $(this).data('editable');
            $(txtdiv).show();
        });
    };
})(jQuery);
