/// <reference path="../typings/jquery/jquery.d.ts"/>
function createSpan(text, cls) {
    return $("<span class='" + cls + "'>" + text + "</span>");
}
function createLabel(text) {
    return createSpan(text, "label");
}
function createString(text) {
    return createSpan('"' + text + '"', "string");
}
function genPreview(value, stop) {
    if (typeof (value) === "object") {
        var text = "";
        if (value instanceof Array) {
            text += "Array[" + value.length + "]";
        }
        else {
            if (stop) {
                text += "Object";
            }
            else {
                text += "Object {";
                var keys = Object.keys(value);
                for (var i = 0; i < keys.length; i++) {
                    if (i > 0) {
                        text += ", ";
                    }
                    var key = keys[i];
                    text += createLabel(key) + ": ";
                    text += genPreview(value[key], true);
                }
                text += "}";
                return text;
            }
        }
        return createSpan(text, "");
    }
    else if (typeof (value) === "number") {
        return createSpan(value, "number");
    }
    else if (typeof (value) === "string") {
        return createString(value);
    }
    else if (typeof (value) === "boolean") {
        return createSpan(value, "boolean");
    }
    else if (typeof (value) === "undefined") {
        return createSpan(value, "undefined");
    }
}
var paths = {};
function genPropsList(obj, parentName) {
    var $root = $("<ul></ul>").addClass("props");
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (typeof (obj[key]) === "object") {
            var path = parentName ? parentName + ":" + key : key;
            var $triangle;
            if (paths[path]) {
                $triangle = createSpan("\u25BC", "triangle");
            }
            else {
                $triangle = createSpan("\u25B6", "triangle");
            }
            var $li = $("<li></li>").css({ position: "relative" }).text(": ").prepend($triangle, createLabel(key)).append(genPreview(obj[key], true));
            if (paths[path]) {
                $li.append(genPropsList(obj[key], path));
            }
            $root.append($li);
            (function (key, val) {
                $triangle.click(function () {
                    var path = parentName ? parentName + ":" + key : key;
                    var $ul;
                    if ($(this).parent().find('> ul').length !== 0) {
                        $ul = $(this).parent().find('> ul');
                        $ul.toggle();
                    }
                    else {
                        $ul = genPropsList(val, path);
                        $(this).parent().append($ul);
                    }
                    if ($ul.is(':visible')) {
                        paths[path] = true;
                        $(this).text('\u25BC');
                    }
                    else {
                        paths[path] = false;
                        $(this).text('\u25B6');
                    }
                });
            })(key, obj[key]);
        }
        else {
            $root.append($("<li></li>").text(": ").prepend(createLabel(key)).append(genPreview(obj[key], true)));
        }
    }
    if (obj instanceof Array) {
        $root.append($("<li></li>").text(": ").prepend(createSpan("length", "read-only")).append(genPreview(obj.length)));
    }
    return $root;
}
var ObjectBrowser = (function () {
    function ObjectBrowser(container) {
        this.container = container;
        this.$container = $(container);
    }
    Object.defineProperty(ObjectBrowser.prototype, "object", {
        set: function (obj) {
            this.$container.empty();
            this.$container.append(genPropsList(obj));
        },
        enumerable: true,
        configurable: true
    });
    ObjectBrowser.prototype.getOpenPaths = function () {
        return Object.keys(paths).filter(function (path) {
            return paths[path];
        });
    };
    return ObjectBrowser;
})();
