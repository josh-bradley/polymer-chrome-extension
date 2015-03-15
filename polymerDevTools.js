var getParentPolymerElementProperties = function() {
    // Build black list of properties we don't want to include in the view
    var blackListProps = ["_elementPrepared", "_instanceAttributes", "_observeNames",
                            "_observers", "_publishLC", "_publishNames", "_readied",
                            "constructor", "element", "eventDelegates", "hasBeenAttached",
                            "observe", "publish", "reflect", "resolvePath", "shadowRoots",
                            "templateInstance"];

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

    var getPolymerElementProperties = function(polymerElement) {
        var props = Object.getOwnPropertyNames(polymerElement);
        // Need to get items in prototype as well.
        return props.concat(Object.getOwnPropertyNames(polymerElement.__proto__));
    };

    var buildBindingsElement = function(polymerElement){
        var props = getPolymerElementProperties(polymerElement);

        var polymerElementProps = newEmptyObject();

        for (var i = 0; i < props.length; ++i) {
            if (blackListProps.indexOf(props[i]) < 0) {
                polymerElementProps[props[i]] = polymerElement[props[i]];
            }
        }

        return polymerElementProps;
    };

    var getPolymerBinding = function(polymerElement, excludeParent, requestingChild) {
        var polymerElementProps = buildBindingsElement(polymerElement);

        if(!excludeParent) {
            var parentPolymerElement = getParentPolymerElement(polymerElement);
            if (parentPolymerElement) {
                polymerElementProps.polymerParent = newEmptyObject();
                polymerElementProps.polymerParent[parentPolymerElement.nodeName.toLowerCase()] = getPolymerBinding(parentPolymerElement, false, polymerElement);
            }
        }

        var polymerChildren = newEmptyObject();
        var children = polymerElement.querySelectorAll("::shadow *");
        for(var i = 0; i < children.length; i++) {
            if(children[i] !== requestingChild && isPolymerElement(children[i])) {
                polymerChildren[children[i].nodeName.toLowerCase()] = getPolymerBinding(children[i], true);
            }
        }

        polymerElementProps.polymerChildren = polymerChildren;

        return polymerElementProps;
    };

    var wrapPolmerBindings = function(elementName, polymerElementProps){
        var obj = newEmptyObject();

        obj[elementName.toLowerCase()] = polymerElementProps;

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
