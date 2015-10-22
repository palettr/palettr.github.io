var main;
var colorData = {};
var colorDataString = "";
var colorB64 = "";
var urlTooLongWarningShown = false;
var hoverDeleteColor = false;
var colorHover = 0;
var mouseLeave = "";
var mouseOver = "";
var paletteCreated = false;

function Main(){}

Main.prototype.color = function()
{
    $('.color').colorPicker({
        GPU: true,
        renderCallback: function($elm, toggled) {
			var colors = this.color.colors;
            var hex = colors.HEX;
			var	rgb = colors.RND.rgb;
            var hsv = colors.RND.hsv;
            var hsl = colors.RND.hsl;

            $elm[0].value = hex;

            main.createJsonColors();
		}
    });
};

Main.prototype.addNewColor = function(addBtn)
{
    if(main.checkIfCanAddColor(addBtn.parent()))
    {
        var wrapperDiv = document.createElement("div");
        wrapperDiv.className = "colorDiv";
        addBtn.parent().append(wrapperDiv);

        var colorElem = document.createElement("input");
        colorElem.className = "color";
        colorElem.placeholder = "Choose color";
        colorElem.onmouseover = function()
        {
            mouseOver = $(this).className;
            if (!colorHover)
            {
                var _this = $(this);
                var colorIndex = _this.index();

                var deleteElem = document.createElement("div");
                deleteElem.className = "deleteColorBtn";
                deleteElem.onclick = function()
                {
                    if (main.removeColorConfirm())
                    {
                        $(this).prev().parent().remove();
                        $(this).remove();
                        main.createJsonColors();
                    }
                };
                deleteElem.onmouseover = function()
                {
                    mouseOver = $(this).className;
                };
                deleteElem.onmouseout = function()
                {
                    if (event.relatedTarget.className !== "color" && event.relatedTarget.className !== "icon-cross" && event.relatedTarget.className !== "deleteColorBtn")
                    {
                        main.removeDeleteIcon();
                    }
                };

                var wrapperChildren = wrapperDiv.children;
                var canAddDelete = true;

                for (var child in wrapperChildren)
                {
                    if (wrapperChildren[child].className !== undefined)
                    {
                        if (wrapperChildren[child].className.indexOf("deleteColorBtn") == 0)
                        {
                            canAddDelete = false;
                            break;
                        }
                    }
                }

                if (canAddDelete)
                {
                    var deleteIcon = document.createElement("i");
                    deleteIcon.className = "icon-cross";

                    if ($(wrapperDiv).children(".deleteColorBtn").length == 0)
                    {
                        $(wrapperDiv).append(deleteElem);
                    }

                    deleteElem.appendChild(deleteIcon);
                }
            }
        };

        colorElem.onmouseout = function(event)
        {
            if (event.relatedTarget.className !== "deleteColorBtn" && event.relatedTarget.className !== "icon-cross")
            {
                main.removeDeleteIcon();
            }
        };

        wrapperDiv.appendChild(colorElem);
    }
};

Main.prototype.removeDeleteIcon = function()
{
    $(".deleteColorBtn").each(function()
    {
        $(this).remove();
    });
};

Main.prototype.addNewPalette = function(addPalette)
{
    var colorPalette = document.createElement("div");
    colorPalette.className = "palette";
    var newColorBtn = document.createElement("input");
    newColorBtn.type = "button";
    newColorBtn.className = "addNewColor";
    newColorBtn.value = "+ New Color";
    newColorBtn.onclick = function()
    {
        main.addNewColor($(this));
    };

    colorPalette.appendChild(newColorBtn);

    var deletePalette = document.createElement("input");
    deletePalette.type = "button";
    deletePalette.className = "addNewColor removePalette";
    deletePalette.value = "Remove Palette";
    deletePalette.onclick = function()
    {
        if(main.removePaletteConfirm())
        {
            $(this).parent().remove();
            colorData = {};
            main.createJsonColors();
        }
    };

    colorPalette.appendChild(deletePalette);

    $(addPalette).parent().next().append(colorPalette);

    $("#about-block").css('visibility', 'hidden');
    aboutVisible = false;
};

Main.prototype.createJsonColors = function()
{
    $(".palette").each(function(index)
    {
        $(this).children().each(function(indexInner)
        {
            if (!$(this).hasClass('addNewColor'))
            {
                var _this = $(this)[0].childNodes[0];
                if (colorData[index] === undefined)
                {
                    colorData[index] = {};
                }

                if (colorData[index][indexInner] === undefined)
                {
                    colorData[index][indexInner] = {};
                }

                colorData[index][indexInner] = _this.value;
            }
        });
    });

    colorDataString = JSON.stringify(colorData);
    colorB64 = Base64.encode(colorDataString);

    var url = window.location.href + "?c=" + colorB64;

    if (url.length > 1999)
    {
        if (!urlTooLongWarningShown)
        {
            $("#url-too-long").css({visibility:"visible", display:"block"});
            urlTooLongWarningShown = false;
            $("#sendMail").css("display", "none");
            $("#urlShare").val("");
        }
    }
    else
    {
        $("#urlShare").val(url);
        $("#url-too-long").css({visibility:"hidden", display:"none"});
    }

    $("#exportColors").attr("href", main.makeTextFile(encodeURIComponent(colorB64)));

};

Main.prototype.export = function()
{

};

Main.prototype.import = function()
{

};

var textFile = null;

Main.prototype.makeTextFile = function (text) 
{
    var data = new Blob([text], {type: 'application/octet-stream'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    if (textFile.indexOf("null") > -1) 
    {
        textFile = textFile.replace("null", window.location.origin);
    }

    return textFile;
};

Main.prototype.checkIfCanAddColor = function(parent)
{
    var count = 0;
    var retFalse = false;

    parent.children().each(function()
    {
        if (count == 8)
        {
            retFalse = true;
        }
        count++;
    });

    if (retFalse)
    {
        return false;
    }

    return true;
};

Main.prototype.checkUrl = function(content)
{
    var url;
    if (content === undefined)
    {
        url = location.href.split("?")[1].substr(2);
        $("#about-block").css('visibility', 'hidden');
        aboutVisible = false;
    }
    else
    {
        url = content;
    }
    var b64Data = Base64.decode(url);
    var b64JsonParse = JSON.parse(b64Data);
    for(var item in b64JsonParse)
    {
        var colorPalette = document.createElement("div");
        colorPalette.className = "palette";
        $("#paletteRow").append(colorPalette);

        var length = (Object.keys(b64JsonParse[item]).length) - 1;

        var count = 0;

        for(var color in b64JsonParse[item])
        {
            if (count == length)
            {
                var newColorBtn = document.createElement("input");
                newColorBtn.type = "button";
                newColorBtn.className = "addNewColor";
                newColorBtn.value = "+ New Color";
                newColorBtn.onclick = function()
                {
                    nColorBtn = $(this);
                    main.addNewColor($(this));
                };

                colorPalette.appendChild(newColorBtn);

                var deletePalette = document.createElement("input");
                deletePalette.type = "button";
                deletePalette.className = "addNewColor removePalette";
                deletePalette.value = "Remove Palette";
                deletePalette.onclick = function()
                {
                    if(main.removePaletteConfirm())
                    {
                        $(this).parent().remove();
                        colorData = {};
                        main.createJsonColors();
                    }
                };

                colorPalette.appendChild(deletePalette);
            }

            if (b64JsonParse[item][color] !== "" && b64JsonParse[item][color] !== undefined)
            {
                var wrapperDiv = document.createElement("div");
                wrapperDiv.className = "colorDiv";
                $(colorPalette).append(wrapperDiv);
                var colorElem = document.createElement("input");
                colorElem.className = "color";
                colorElem.placeholder = "Choose color";
                colorElem.value = b64JsonParse[item][color];
                colorElem.style.background = "#" + b64JsonParse[item][color];
                colorElem.onmouseover = function()
                {
                    mouseOver = $(this).className;
                    if (!colorHover)
                    {
                        var _this = $(this);
                        var colorIndex = _this.index();

                        var deleteElem = document.createElement("div");
                        deleteElem.className = "deleteColorBtn";
                        deleteElem.onclick = function()
                        {
                            if (main.removeColorConfirm())
                            {
                                $(this).prev().parent().remove();
                                $(this).remove();
                                main.createJsonColors();
                            }
                        };
                        deleteElem.onmouseover = function()
                        {
                            mouseOver = $(this).className;
                        };
                        deleteElem.onmouseout = function(event)
                        {
                            if (event.relatedTarget.className !== "color" && event.relatedTarget.className !== "icon-cross" && event.relatedTarget.className !== "deleteColorBtn")
                            {
                                main.removeDeleteIcon();
                            }
                        };

                        var wrapperChildren = wrapperDiv.children;
                        var canAddDelete = true;

                        for (var child in wrapperChildren)
                        {
                            if (wrapperChildren[child].className !== undefined)
                            {
                                if (wrapperChildren[child].className.indexOf("deleteColorBtn") === 0)
                                {
                                    canAddDelete = false;
                                    break;
                                }
                            }
                        }

                        if (canAddDelete)
                        {
                            var deleteIcon = document.createElement("i");
                            deleteIcon.className = "icon-cross";

                            if ($(this).parent().children(".deleteColorBtn").length == 0)
                            {
                                $(this).parent().append(deleteElem);
                            }

                            deleteElem.appendChild(deleteIcon);
                        }
                    }
                };

                colorElem.onmouseout = function(event)
                {
                    if (event.relatedTarget.className !== "deleteColorBtn" && event.relatedTarget.className !== "icon-cross")
                    {
                        main.removeDeleteIcon();
                    }
                };

                wrapperDiv.appendChild(colorElem);
            }

            count++;
        }
    }

    main.createJsonColors();

};

Main.prototype.removePaletteConfirm = function()
{
    return confirm("Are you sure you want to delete this palette?");
};

Main.prototype.removeColorConfirm = function()
{
    return confirm("Are you sure you want to delete this color?");
};

Main.prototype.fileChanged = function()
{
    var file = $("#fileUpload")[0].files[0];
    var reader = new FileReader();

	reader.onload = function(e)
    {
        $("#about-block").css('visibility', 'hidden');
        aboutVisible = false;
		main.checkUrl(decodeURIComponent(reader.result));
	};

	reader.readAsBinaryString(file);

};

Main.prototype.sendMail = function()
{
    var url = $("#urlShare").val();
    var link = "mailto:?body=" + url;

    window.location.href = link;
};

Main.prototype.highLightButton = function()
{
    $("#addNewPalette").delay(1000).fadeIn(500).fadeOut(300).fadeIn(500).fadeOut(300).fadeIn(500).fadeOut(300).fadeIn(500);
};

$(document).ready(function()
{
    main = new Main();

    main.color();

    $(".addNewColor").on('click', function()
    {
        main.addNewColor($(this));//this is causing the issue
    });

    $("#addNewPalette").on('click', function()
    {
        paletteCreated = true;
        main.addNewPalette($(this));
    });

    $(".removePalette").on('click', function()
    {
        $(this).parent().remove();
        colorData = {};
    });

    $("#exportColors").on("click", function()
    {
        main.export();
    });

    $("#fileUpload").on('change', function()
    {
        main.fileChanged();
        $(this).val();
    });

    $("#sendMail").on('click', function()
    {
        main.sendMail();
    });

    var aboutVisible = false;

    $("#footer-notes").on('click', function()
    {
        if (!aboutVisible)
        {
            $("#about-block").css('visibility', 'visible');
            aboutVisible = true;
        }
        else
        {
            $("#about-block").css('visibility', 'hidden');
            aboutVisible = false;
        }
    });

    $("#close-about").on('click', function()
    {
        $("#about-block").css('visibility', 'hidden');
        aboutVisible = false;
    });

    main.highLightButton();
    main.checkUrl();
});
