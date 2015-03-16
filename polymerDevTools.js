var getParentPolymerElementProperties = function() {
    // Build black list of properties we don't want to include in the view
    var blackListProps = ["_elementPrepared", "_instanceAttributes", "_observeNames",
                            "_observers", "_publishLC", "_publishNames", "_readied",
                            "constructor", "element", "eventDelegates", "hasBeenAttached",
                            "observe", "publish", "reflect", "resolvePath", "shadowRoots",
                            "templateInstance", "templateInstance_"];

    blackListProps = blackListProps.concat(Object.getOwnPropertyNames(document.body));

    var newEmptyObject = function(){
        return { __proto__ : null };
    }

    var isPolymerElement = function(element) {
        return element.PolymerBase;
    }

    var getParentPolymerElement = function(element){
        if(!(element && (element.parentNode || element.host))) {
            return;
        }

        var parentElement = element.parentNode || element.host;
        if(isPolymerElement(parentElement)) {
            return parentElement;
        }
        else {
            return getParentPolymerElement(parentElement);
        }
    };

    var getElementProperties = function(polymerElement) {
        var props = Object.getOwnPropertyNames(polymerElement);
        // Need to get items in prototype as well.
        return props.concat(Object.getOwnPropertyNames(polymerElement.__proto__));
    };

    var getUserBindings = function(polymerElement){
        var props = getElementProperties(polymerElement);

        var polymerElementProps = newEmptyObject();

        for (var i = 0; i < props.length; ++i) {
            if (blackListProps.indexOf(props[i]) < 0) {
                polymerElementProps[props[i]] = polymerElement[props[i]];
            }
        }

        return polymerElementProps;
    };

    var getPolymerBinding = function(element, parentBindings, childBindings) {
        var elementBindings = getUserBindings(element);

        var parentPolymerElement = getParentPolymerElement(element);
        if (parentPolymerElement) {
            elementBindings.$parent = newEmptyObject();
            elementBindings.$parent[parentPolymerElement.nodeName.toLowerCase()] = parentBindings || getPolymerBinding(parentPolymerElement, false, elementBindings);
        }

        var children = element.querySelectorAll("::shadow *");
        var polymerChildren = newEmptyObject();
        for (var i = 0; i < children.length; i++) {
            if (children[i] === childBindings) {
                polymerChildren[children[i].nodeName.toLowerCase()] = childBindings;
            } else if (isPolymerElement(children[i])) {
                polymerChildren[children[i].nodeName.toLowerCase()] = getPolymerBinding(children[i], elementBindings);
            }
        }

        if(Object.getOwnPropertyNames(polymerChildren).length > 0) {
            elementBindings.$children = polymerChildren;
        }

        return elementBindings;
    };

    var wrapPolmerBindings = function(elementName, elementBindings){
        var obj = newEmptyObject();

        obj[elementName.toLowerCase()] = elementBindings;

        return obj;
    };

    var parentPolymerElement = getParentPolymerElement($0);

    if(parentPolymerElement)
        return wrapPolmerBindings(parentPolymerElement.nodeName, getPolymerBinding(parentPolymerElement));

    return newEmptyObject();
}

chrome.devtools.panels.elements.createSidebarPane(
    "Polymer",
    function(sidebar) {
    function setParentPolymentProperties() {
        sidebar.setExpression("(" + getParentPolymerElementProperties.toString() + ")()");
    }
    setParentPolymentProperties();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(setParentPolymentProperties);
});
