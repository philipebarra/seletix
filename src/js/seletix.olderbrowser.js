"use strict";

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== "undefined" &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var Seletix =
  /*#__PURE__*/
  (function() {
    function Seletix(id, o) {
      var _this = this;

      _classCallCheck(this, Seletix);

      //params
      this._params = _typeof(o) === "object" ? o : new Object();
      this.setDefault("delay", 400);
      this.setDefault("minLength", 2);
      this.setDefault("limit", 10);
      this.setDefault("showCaret", true);
      this._originalSelect = document.getElementById(id);
      this._originalSelect.style = "display: none";
      this._selectedElement = "";
      this._inputCache = ""; //creating elements

      this._div = document.createElement("div"); // this._div.style = 'background-color:blue;';

      this._input = document.createElement("input");
      this._input.className = "".concat(__tc.INPUT);
      this._results = document.createElement("div");
      this._results.classList = __tc.DIV_RESULTS;

      this._div.appendChild(this._input);

      if (this._params.showCaret) {
        this._image = document.createElement("i");
        this._image.innerHTML = "&#9660;";
        this._image.classList = __tc.ICON;
        this._image.style.cursor = "default";

        this._div.appendChild(this._image);

        this._image.addEventListener("click", function(e) {
          return _this.click(e);
        });
      }

      this._div.appendChild(this._results);

      this.hide(this._results);

      this._originalSelect.insertAdjacentElement("afterend", this._div); //creating result div and calculating its width

      var html = "";
      var maxString = 0;

      this._originalSelect.querySelectorAll("option").forEach(function(e) {
        if (e.textContent.length > maxString) {
          maxString = e.textContent.length;
        }

        var search = _this._convertLetters(e.textContent);

        html += '<li data-value="'
          .concat(e.value, '" class="')
          .concat(__tc.ITEM, '" data-search="')
          .concat(search, '">')
          .concat(e.textContent, "</li>");
      });

      this._elements = this._div.getElementsByTagName("li");
      var size = Math.ceil(maxString / 2);
      this._results.style.width = "".concat(size, "em");
      this._results.innerHTML = '<ul class="'
        .concat(__tc.LIST, '">')
        .concat(html, "</ul>"); //adding listners

      this._input.addEventListener("click", function(e) {
        return _this.click(e);
      });

      this._input.addEventListener("keyup", function(e) {
        return _this.keyUp(e);
      });

      this._input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") e.preventDefault();
      });

      this._results.addEventListener("mouseover", function(e) {
        return _this.mouseHover(e);
      });

      this._results.addEventListener("mouseout", function(e) {
        return _this.mouseOut(e);
      });

      this._results.addEventListener("click", function(e) {
        return _this.resultsClicked(e);
      });

      document.addEventListener("click", function(e) {
        return _this.close(e);
      });
      this._timeout = null; //selecting the same original value

      this.select(this._originalSelect.value);
    }

    _createClass(Seletix, [
      {
        key: "setDefault",
        value: function setDefault(name, value) {
          this._params["".concat(name)] =
            typeof this._params["".concat(name)] !== "undefined"
              ? this._params["".concat(name)]
              : value;
        }
      },
      {
        key: "mouseOut",
        value: function mouseOut(e) {
          //removing selection when mouse is outside of results
          var elements = this._results.querySelectorAll(
            ".".concat(__tc.ACTIVE)
          );

          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("".concat(__tc.ACTIVE));
          }
        }
        /**
         * Hides the results
         * @param {*} e
         */
      },
      {
        key: "close",
        value: function close(e) {
          if (e.target !== this._input && e.target !== this._image) {
            this.hide(this._results);
          }
        }
      },
      {
        key: "mouseHover",
        value: function mouseHover(e) {
          if (e.target.tagName.toLocaleLowerCase() !== "li")
            //mouse over scrollbar for ex
            return;
          this.goToElementAndSelect(e.target);
        }
      },
      {
        key: "click",
        value: function click() {
          if (!this.isVisible(this._results)) {
            this.goToElementAndSelect(this._selectedElement);
            this.showResults(this._results);
          } else {
            this.hide(this._results);
          }
        }
      },
      {
        key: "keyUp",
        value: function keyUp(e) {
          var _this2 = this;

          switch (e.key) {
            case "ArrowDown":
              this.showResults(this._results);

              this._next();

              break;

            case "ArrowUp":
              this.showResults(this._results);

              this._previous();

              break;

            case "Enter":
              if (this._selectedElement !== "") {
                this._confirm(this.visibleElements()[this._selectedElement]);

                this.hide(this._results);
                return false;
              }

              break;

            case "Escape":
              this._input.value = this._inputCache;
              this.hide(this._results);
              break;

            case "Backspace":
              clearTimeout(this._timeout);
              this._timeout = setTimeout(function() {
                _this2.deselect();

                _this2._search();

                _this2.showResults(_this2._results);
              }, this._params.delay);
              break;

            case "ArrowLeft":
            case "ArrowRight":
            case "Alt":
            case "AltGraph":
              break;

            default:
              clearTimeout(this._timeout);
              this._timeout = setTimeout(function() {
                _this2.deselect();

                _this2._search();

                _this2.showResults(_this2._results);
              }, this._params.delay);
              break;
          } // if (e.key === 'ArrowDown') {
          //     this.showResults(this._results);
          //     this._next();
          // } else if (e.key === 'ArrowUp') {
          //     this.showResults(this._results);
          //     this._previous();
          // } else if (e.key === 'Enter') {
          //     if (this._selectedElement !== '') {
          //         this._confirm(this.visibleElements()[this._selectedElement]);
          //         this.hide(this._results);
          //     }
          // } else if (e.key === 'Escape') {
          //     this._input.value = this._inputCache;
          //     this.hide(this._results);
          // } else if (e.key === 'Backspace') {
          //     clearTimeout(this._timeout);
          //     this._timeout = setTimeout(() => {
          //         this.deselect();
          //         this._search();
          //         this.showResults(this._results);
          //     }, this._params.delay);
          // }
          // else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Alt' || e.key === 'AltGraph') {
          // }
          // else {
          //     clearTimeout(this._timeout);
          //     this._timeout = setTimeout(() => {
          //         this.deselect();
          //         this._search();
          //         this.showResults(this._results);
          //     }, this._params.delay);
          // }
        }
      },
      {
        key: "resultsClicked",
        value: function resultsClicked(e) {
          if (e.target.tagName.toLocaleLowerCase() !== "li") {
            //mouse over scrollbar for ex
            return;
          }

          this._input.value = e.target.textContent;
          this._originalSelect.value = e.target.dataset.value;
          this._selectedElement = this._originalSelect.selectedIndex;
          this.goToElementAndSelect(e.target);
          this.hide(this._results);
        }
        /**
         * List of all visible elements
         */
      },
      {
        key: "visibleElements",
        value: function visibleElements() {
          return this._results.querySelectorAll(
            'li:not([style*="display:none"]):not([style*="display: none"])'
          );
        }
      },
      {
        key: "goToElementAndSelect",
        value: function goToElementAndSelect(e) {
          //search for the index of element to select
          var elements = this.visibleElements();

          for (var i = 0; i < elements.length; i++) {
            if (elements[i] === e) {
              this.selectElement(i);
              return i;
            }
          }
        }
      },
      {
        key: "_confirm",
        value: function _confirm(e) {
          this._originalSelect.value = e.dataset.value;
          this._input.value = e.textContent;
        }
      },
      {
        key: "_search",
        value: function _search() {
          this._inputCache = this._input.value; //user clear the text then shows everything

          if (this._input.value.length === 0) {
            for (var i = 0; i < this._elements.length; i++) {
              this.show(this._elements[i]);
            }
          } //search only if minLength is configured

          if (this._params.minLength > this._input.value.length) {
            return;
          } //if source is set by user then use ajax/function

          if (this._params.source !== undefined) {
            this.ajax();
            return;
          }

          var q = this._convertLetters(this._input.value);

          for (var _i = 0; _i < this._elements.length; _i++) {
            // for (let i = 0; i < this._params.maxLength; i++) {
            //match
            if (this._elements[_i].dataset.search.indexOf(q) !== -1) {
              this.show(this._elements[_i]);
            } else {
              //no match
              this.hide(this._elements[_i]);
            }
          }
        }
      },
      {
        key: "processJson",
        value: function processJson(json) {
          this._inputCache = this._input.value;
          var size = json.length;
          var html = "";
          var originalSelect = "";

          for (var i = 0; i < size; i++) {
            html += "<li class='"
              .concat(__tc.ITEM, "' data-value=\"")
              .concat(json[i].id, '">')
              .concat(json[i].label, "</li>");
            originalSelect += '<option value="'
              .concat(json[i].id, '">')
              .concat(json[i].label, "</option>");
          }

          this._results.innerHTML = '<ul class="'
            .concat(__tc.LIST, '">')
            .concat(html, "</ul>");
          this._originalSelect.innerHTML = originalSelect;
          this.showResults(this._results);
        }
      },
      {
        key: "highlight",
        value: function highlight(q) {}
        /**
         * Return index of an element on a visible list
         * @param {*} element
         */
      },
      {
        key: "indexOnVisibleList",
        value: function indexOnVisibleList(element) {
          var elements = this.visibleElements();

          for (var i = 0; i < elements.length; i++) {
            if (element === elements[i].length) return i;
          }
        }
      },
      {
        key: "_next",
        value: function _next() {
          var activeElement = this.getActiveElement();
          var element = null;

          if (!activeElement) {
            element = this.selectFirstElement();
            this._input.value = element.textContent;
            return;
          }

          var visibleElements = this.visibleElements();
          var activeElementIndex = this.getActiveElementIndex(); // for (let i = (activeElementIndex + 1); i < visibleElements.length; i++) {
          //
          //     element = this.selectElement(i);
          //     this._input.value = element.textContent;
          //     break;
          // }

          var i = activeElementIndex + 1;

          if (i < visibleElements.length) {
            element = this.selectElement(i);
            this._input.value = element.textContent;
          }

          if (element) this.__scrollToIfIsNotVisible(this._results, element);
        }
      },
      {
        key: "_previous",
        value: function _previous() {
          var activeElement = this.getActiveElement();
          var element = null;

          if (!activeElement) {
            element = this.selectLastElement();
            this._input.value = element.textContent;
            return;
          }

          var activeElementIndex = this.getActiveElementIndex(); // for (let i = (activeElementIndex - 1); i >= 0; i--) {
          //     element = this.selectElement(i);
          //     this._input.value = element.textContent;
          //     break;
          // }

          var i = activeElementIndex - 1;

          if (i >= 0) {
            element = this.selectElement(i);
            this._input.value = element.textContent;
          }

          if (element) this.__scrollToIfIsNotVisible(this._results, element);
        }
        /**
         * Returns the active element (has .active class)
         */
      },
      {
        key: "getActiveElement",
        value: function getActiveElement() {
          return this._results.querySelector(".".concat(__tc.ACTIVE));
        }
        /**
         * Return the index of an active element in a visible list
         */
      },
      {
        key: "getActiveElementIndex",
        value: function getActiveElementIndex() {
          var visibleElements = this.visibleElements();
          var activeElement = this.getActiveElement();

          for (var i = 0; i < visibleElements.length; i++) {
            if (activeElement === visibleElements[i]) return i;
          }
        }
      },
      {
        key: "selectFirstElement",
        value: function selectFirstElement() {
          return this.selectElement(0);
        }
      },
      {
        key: "selectLastElement",
        value: function selectLastElement() {
          var visibleElements = this.visibleElements();
          var lastIndex = visibleElements.length - 1;
          return this.selectElement(lastIndex, visibleElements);
        }
      },
      {
        key: "selectElement",
        value: function selectElement(index, visibleElements) {
          visibleElements =
            typeof visibleElements === "undefined"
              ? this.visibleElements()
              : visibleElements;
          var element = visibleElements[index]; //if index does not return any element

          if (!element) return; //if there is no selected element default is the first one

          if (!this._selectedElement) this._selectedElement = 0; //remove previous selection

          var selected = this._results.querySelectorAll(
            ".".concat(__tc.ACTIVE)
          );

          if (selected) {
            selected.forEach(function(el) {
              el.classList.remove("".concat(__tc.ACTIVE));
            });
          }

          element.classList.add("".concat(__tc.ACTIVE));
          this._selectedElement = index;
          return element;
        }
        /**
         * Select an element by value
         * @param value
         */
      },
      {
        key: "select",
        value: function select(value) {
          var element = this._results.querySelector(
            'li[data-value="'.concat(value, '"]')
          );

          var allElements = this._results.querySelectorAll("li"); //remove previous selection

          this.deselect(); // let selected = this._results.querySelectorAll(`.${__tc.ACTIVE}`);
          // if (selected) {
          //     selected.forEach((el) => {
          //         el.classList.remove(`${__tc.ACTIVE}`);
          //     });
          // }
          //select element

          var i = 0;

          for (i; i < allElements.length; i++) {
            if (element === allElements[i]) {
              element.classList.add("".concat(__tc.ACTIVE));
              this._selectedElement = i;
              this._input.value = element.textContent;
              this._originalSelect.value = value;
              break;
            }
          } //set text on input

          return element;
        }
      },
      {
        key: "deselect",
        value: function deselect() {
          var element = this.getActiveElement();

          if (element) {
            element.classList.remove("".concat(__tc.ACTIVE));
            this._selectedElement = "";
          }

          this._originalSelect.value = "";
        }
      },
      {
        key: "ajax",
        value: function ajax() {
          var _this3 = this;

          //if source is a function
          if (typeof this._params.source === "function") {
            this.processJson(this._params.source());
            return;
          } //if source is url

          var url = ""
            .concat(this._params.source, "?q=")
            .concat(this._input.value);
          url = encodeURI(url);
          fetch("".concat(url), {
            method: "GET" // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // body: 'foo=bar&blah=1'
          })
            .then(function(response) {
              return response.json();
            })
            .then(function(json) {
              return _this3.processJson(json);
            });
        }
      },
      {
        key: "showResults",
        value: function showResults() {
          if (this.visibleElements().length > 8) {
            this._results.style.overflowY = "auto";
          } else {
            this._results.style.overflowY = "hidden";
          }

          this.show(this._results);

          if (this._results.offsetWidth < this._input.offsetWidth) {
            this._results.style.width = "".concat(
              this._input.offsetWidth,
              "px"
            );
          }
        }
      },
      {
        key: "show",
        value: function show(element) {
          element.style.display = "";
        }
      },
      {
        key: "hide",
        value: function hide(element) {
          element.style.display = "none";
        }
      },
      {
        key: "isVisible",
        value: function isVisible(element) {
          return element.style.display !== "none";
        }
      },
      {
        key: "_convertLetters",
        value: function _convertLetters(str) {
          if (!str) return "";
          return str
            .replace(/[ÀÁÂÃÄÅ]/g, "A")
            .replace(/[ÈÉÊË]/g, "E")
            .replace(/[ÌÍÎÏ]/g, "I")
            .replace(/[ÒÓÔÖ]/g, "O")
            .replace(/[ÙÚÛÜ]/g, "U")
            .replace(/[Ç]/g, "C")
            .replace(/[àáâãäå]/g, "a")
            .replace(/[èéêë]/g, "e")
            .replace(/[ìíîï]/g, "i")
            .replace(/[òóôö]/g, "o")
            .replace(/[ùúûü]/g, "u")
            .replace(/[ç]/g, "c")
            .replace(/[^\sA-Za-z]/g, "")
            .toLocaleLowerCase();
        }
      },
      {
        key: "setValues",
        value: function setValues() {}
        /**
         * Add an item to the list and the original select
         * @param {*} o
         */
      },
      {
        key: "add",
        value: function add(o) {
          var ul = this._results.querySelector("ul");

          var search = this._convertLetters(o.label);

          ul.insertAdjacentHTML(
            "beforeEnd",
            '<li data-value="'
              .concat(o.id, '" class="')
              .concat(__tc.ITEM, '" data-search="')
              .concat(search, '">')
              .concat(o.label, "</li>")
          );

          this._originalSelect.insertAdjacentHTML(
            "beforeend",
            '<option value="'.concat(o.id, '">').concat(o.label, "</option>")
          );
        }
        /**
         * Removes one item from the list and the original select
         * @param {*} value
         */
      },
      {
        key: "remove",
        value: function remove(value) {
          //removing from object
          var li = this._results.querySelector(
            'li[data-value="'.concat(value, '"]')
          );

          li.parentElement.removeChild(li); //removing from original select

          var option = this._originalSelect.querySelector(
            'option[value="'.concat(value, '"]')
          );

          option.parentElement.removeChild(option);
        }
        /**
         * Removes everything created by this class and shows the original select back
         */
      },
      {
        key: "destroy",
        value: function destroy() {
          this._div.innerHTML = "";

          this._div.parentElement.removeChild(this._div);

          this.show(this._originalSelect);
        }
      },
      {
        key: "__scrollToIfIsNotVisible",
        value: function __scrollToIfIsNotVisible(parent, child) {
          // Where is the parent on page
          var parentRect = parent.getBoundingClientRect(); // What can you see?

          var parentViewableArea = {
            height: parent.clientHeight,
            width: parent.clientWidth
          }; // Where is the child

          var childRect = child.getBoundingClientRect(); // console.log(childRect);
          // Is the child viewable?

          var isViewable =
            childRect.top >= parentRect.top &&
            childRect.top <= parentRect.top + parentViewableArea.height; // if you can't see the child try to scroll parent

          if (!isViewable) {
            // scroll by offset relative to parent
            //before scroll check if the bottom of child will be visible on next scroll
            if (parentRect.bottom - childRect.top < childRect.height) {
              parent.scrollTop =
                childRect.bottom + parent.scrollTop - parentRect.bottom; // child.scrollIntoView(false);
            } else {
              parent.scrollTop =
                childRect.top + parent.scrollTop - parentRect.top; // child.scrollIntoView();
            }
          }
        }
      }
    ]);

    return Seletix;
  })();

var __tc = {
  ACTIVE: "active",
  ITEM: "list-group-item",
  LIST: "list-group",
  INPUT: "form-control",
  ICON: "___select-caret-down-icon",
  DIV_RESULTS: "___select-all-options"
};
Object.freeze(__tc);
