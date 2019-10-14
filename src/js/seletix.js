class Seletix {

    constructor(id, o) {

        //params
        this._params = typeof o === 'object' ? o : new Object();

        this.setDefault('delay', 400);
        this.setDefault('minLength', 2);
        this.setDefault('limit', 10);
        this.setDefault('showCaret', true);

        this._originalSelect = document.getElementById(id);
        this._originalSelect.style = 'display: none';

        this._selectedElement = '';
        this._inputCache = '';

        //creating elements
        this._div = document.createElement('div');
        // this._div.style = 'background-color:blue;';
        this._input = document.createElement('input');
        this._input.className = `${__tc.INPUT}`;

        this._results = document.createElement('div');
        this._results.classList = __tc.DIV_RESULTS;

        this._div.appendChild(this._input);
        if (this._params.showCaret) {
            this._image = document.createElement('i');
            this._image.innerHTML = '&#9660;';
            this._image.classList = __tc.ICON;
            this._image.style.cursor = 'default';
            this._div.appendChild(this._image);

            this._image.addEventListener('click', (e) => this.click(e));
        }
        this._div.appendChild(this._results);
        this.hide(this._results);
        this._originalSelect.insertAdjacentElement('afterend', this._div);

        //creating result div and calculating its width
        let html = '';
        let maxString = 0;
        this._originalSelect.querySelectorAll('option').forEach((e) => {

            if (e.textContent.length > maxString) {
                maxString = e.textContent.length;
            }

            let search = this._convertLetters(e.textContent);
            html += `<li data-value="${e.value}" class="${__tc.ITEM}" data-search="${search}">${e.textContent}</li>`;
        });

        this._elements = this._div.getElementsByTagName('li');

        let size = Math.ceil(maxString / 2);
        this._results.style.width = `${size}em`;
        this._results.innerHTML = `<ul class="${__tc.LIST}">${html}</ul>`;

        //adding listners
        this._input.addEventListener('click', (e) => this.click(e));
        this._input.addEventListener('keyup', (e) => this.keyUp(e));
        this._input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                e.preventDefault();
        });

        this._results.addEventListener('mouseover', (e) => this.mouseHover(e));
        this._results.addEventListener('mouseout', (e) => this.mouseOut(e));
        this._results.addEventListener('click', (e) => this.resultsClicked(e));
        document.addEventListener('click', (e) => this.close(e));

        this._timeout = null;

        //selecting the same original value
        this.select(this._originalSelect.value);
    }

    setDefault(name, value) {
        this._params[`${name}`] = typeof this._params[`${name}`] !== 'undefined' ? this._params[`${name}`] : value;
    }

    mouseOut(e) {
        //removing selection when mouse is outside of results
        let elements = this._results.querySelectorAll(`.${__tc.ACTIVE}`);
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove(`${__tc.ACTIVE}`);
        }
    }

    /**
     * Hides the results
     * @param {*} e
     */
    close(e) {
        if ((e.target !== this._input) && (e.target !== this._image)) {
            this.hide(this._results);
        }
    }

    mouseHover(e) {
        if (e.target.tagName.toLocaleLowerCase() !== 'li')//mouse over scrollbar for ex
            return;

        this.goToElementAndSelect(e.target);
    }

    click() {
        if (!this.isVisible(this._results)) {
            this.goToElementAndSelect(this._selectedElement);
            this.showResults(this._results);
        } else {
            this.hide(this._results);
        }
    }

    keyUp(e) {
        switch (e.key) {
            case 'ArrowDown':
                this.showResults(this._results);
                this._next();
                break;
            case 'ArrowUp':
                this.showResults(this._results);
                this._previous();
                break;
            case 'Enter':
                if (this._selectedElement !== '') {
                    this._confirm(this.visibleElements()[this._selectedElement]);
                    this.hide(this._results);
                    return false;
                }
                break;
            case 'Escape':
                this._input.value = this._inputCache;
                this.hide(this._results);
                break;
            case 'Backspace':
                clearTimeout(this._timeout);
                this._timeout = setTimeout(() => {

                    this.deselect();
                    this._search();
                    this.showResults(this._results);

                }, this._params.delay);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'Alt':
            case 'AltGraph':
                break;
            default:
                clearTimeout(this._timeout);
                this._timeout = setTimeout(() => {

                    this.deselect();
                    this._search();
                    this.showResults(this._results);

                }, this._params.delay);
                break;
        }

        // if (e.key === 'ArrowDown') {
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

    resultsClicked(e) {
        if (e.target.tagName.toLocaleLowerCase() !== 'li') {//mouse over scrollbar for ex
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
    visibleElements() {
        return this._results.querySelectorAll('li:not([style*="display:none"]):not([style*="display: none"])');
    }

    goToElementAndSelect(e) {
        //search for the index of element to select
        let elements = this.visibleElements();
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] === e) {
                this.selectElement(i);
                return i;
            }
        }
    }

    _confirm(e) {
        this._originalSelect.value = e.dataset.value;
        this._input.value = e.textContent;
    }

    _search() {

        this._inputCache = this._input.value;
        //user clear the text then shows everything
        if (this._input.value.length === 0) {
            for (let i = 0; i < this._elements.length; i++) {
                this.show(this._elements[i]);
            }
        }
        //search only if minLength is configured
        if (this._params.minLength > this._input.value.length) {
            return;
        }

        //if source is set by user then use ajax/function
        if (this._params.source !== undefined) {
            this.ajax();
            return;
        }

        let q = this._convertLetters(this._input.value);
        for (let i = 0; i < this._elements.length; i++) {
            // for (let i = 0; i < this._params.maxLength; i++) {

            //match
            if (this._elements[i].dataset.search.indexOf(q) !== -1) {
                this.show(this._elements[i]);
            } else {//no match
                this.hide(this._elements[i]);
            }
        }
    }

    processJson(json) {

        this._inputCache = this._input.value;
        let size = json.length;
        let html = '';
        let originalSelect = '';
        for (let i = 0; i < size; i++) {
            html += `<li class='${__tc.ITEM}' data-value="${json[i].id}">${json[i].label}</li>`;
            originalSelect += `<option value="${json[i].id}">${json[i].label}</option>`;
        }

        this._results.innerHTML = `<ul class="${__tc.LIST}">${html}</ul>`;
        this._originalSelect.innerHTML = originalSelect;
        this.showResults(this._results);
    }

    highlight(q) {

    }

    /**
     * Return index of an element on a visible list
     * @param {*} element
     */
    indexOnVisibleList(element) {
        let elements = this.visibleElements();
        for (let i = 0; i < elements.length; i++) {
            if (element === elements[i].length)
                return i;
        }
    }

    _next() {
        let activeElement = this.getActiveElement();
        let element = null;

        if (!activeElement) {
            element = this.selectFirstElement();
            this._input.value = element.textContent;
            return;
        }

        let visibleElements = this.visibleElements();
        let activeElementIndex = this.getActiveElementIndex();
        // for (let i = (activeElementIndex + 1); i < visibleElements.length; i++) {
        //
        //     element = this.selectElement(i);
        //     this._input.value = element.textContent;
        //     break;
        // }

        let i = activeElementIndex + 1;
        if (i < visibleElements.length) {
            element = this.selectElement(i);
            this._input.value = element.textContent;
        }

        if (element)
            this.__scrollToIfIsNotVisible(this._results, element);
    }

    _previous() {
        let activeElement = this.getActiveElement();
        let element = null;

        if (!activeElement) {
            element = this.selectLastElement();
            this._input.value = element.textContent;
            return;
        }

        let activeElementIndex = this.getActiveElementIndex();
        // for (let i = (activeElementIndex - 1); i >= 0; i--) {
        //     element = this.selectElement(i);
        //     this._input.value = element.textContent;
        //     break;
        // }
        let i = activeElementIndex - 1;
        if (i >= 0) {
            element = this.selectElement(i);
            this._input.value = element.textContent;
        }

        if (element)
            this.__scrollToIfIsNotVisible(this._results, element);
    }

    /**
     * Returns the active element (has .active class)
     */
    getActiveElement() {
        return this._results.querySelector(`.${__tc.ACTIVE}`);
    }

    /**
     * Return the index of an active element in a visible list
     */
    getActiveElementIndex() {
        let visibleElements = this.visibleElements();
        let activeElement = this.getActiveElement();
        for (let i = 0; i < visibleElements.length; i++) {

            if (activeElement === visibleElements[i])
                return i;
        }
    }

    selectFirstElement() {
        return this.selectElement(0);
    }

    selectLastElement() {
        let visibleElements = this.visibleElements();
        let lastIndex = visibleElements.length - 1;

        return this.selectElement(lastIndex, visibleElements);
    }

    selectElement(index, visibleElements) {

        visibleElements = typeof visibleElements === 'undefined' ? this.visibleElements() : visibleElements;
        let element = visibleElements[index];

        //if index does not return any element
        if (!element)
            return;

        //if there is no selected element default is the first one
        if (!this._selectedElement)
            this._selectedElement = 0;

        //remove previous selection
        let selected = this._results.querySelectorAll(`.${__tc.ACTIVE}`);
        if (selected) {
            selected.forEach((el) => {
                el.classList.remove(`${__tc.ACTIVE}`);
            });
        }

        element.classList.add(`${__tc.ACTIVE}`);
        this._selectedElement = index;
        return element;
    }

    /**
     * Select an element by value
     * @param value
     */
    select(value) {
        let element = this._results.querySelector(`li[data-value="${value}"]`);

        let allElements = this._results.querySelectorAll('li');

        //remove previous selection
        this.deselect();
        // let selected = this._results.querySelectorAll(`.${__tc.ACTIVE}`);
        // if (selected) {
        //     selected.forEach((el) => {
        //         el.classList.remove(`${__tc.ACTIVE}`);
        //     });
        // }

        //select element
        let i = 0;
        for (i; i < allElements.length; i++) {
            if (element === allElements[i]) {

                element.classList.add(`${__tc.ACTIVE}`);
                this._selectedElement = i;
                this._input.value = element.textContent;
                this._originalSelect.value = value;
                break;
            }
        }

        //set text on input
        return element;
    }

    deselect() {
        let element = this.getActiveElement();

        if (element) {
            element.classList.remove(`${__tc.ACTIVE}`);
            this._selectedElement = '';
        }

        this._originalSelect.value = '';
    }

    ajax() {
        //if source is a function
        if (typeof this._params.source === 'function') {
            this.processJson(this._params.source());
            return;
        }

        //if source is url
        let url = `${this._params.source}?q=${this._input.value}`;
        url = encodeURI(url);

        fetch(`${url}`, {
            method: 'GET',
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // body: 'foo=bar&blah=1'
        })
            .then(response => response.json())
            .then(json => this.processJson(json));
    }

    showResults() {
        if (this.visibleElements().length > 8) {
            this._results.style.overflowY = 'auto';
        } else {
            this._results.style.overflowY = 'hidden';
        }

        this.show(this._results);
        if (this._results.offsetWidth < this._input.offsetWidth) {
            this._results.style.width = `${this._input.offsetWidth}px`;
        }
    }

    show(element) {
        element.style.display = '';
    }

    hide(element) {
        element.style.display = 'none';
    }

    isVisible(element) {
        return element.style.display !== 'none';
    }

    _convertLetters(str) {
        if (!str)
            return '';

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
            .replace(/[^\sA-Za-z]/g, '')
            .toLocaleLowerCase();
    }

    setValues() {

    }

    /**
     * Add an item to the list and the original select
     * @param {*} o
     */
    add(o) {
        let ul = this._results.querySelector('ul');
        let search = this._convertLetters(o.label);
        ul.insertAdjacentHTML('beforeEnd', `<li data-value="${o.id}" class="${__tc.ITEM}" data-search="${search}">${o.label}</li>`);

        this._originalSelect.insertAdjacentHTML('beforeend', `<option value="${o.id}">${o.label}</option>`);
    }

    /**
     * Removes one item from the list and the original select
     * @param {*} value
     */
    remove(value) {
        //removing from object
        let li = this._results.querySelector(`li[data-value="${value}"]`);
        li.parentElement.removeChild(li);

        //removing from original select
        let option = this._originalSelect.querySelector(`option[value="${value}"]`);
        option.parentElement.removeChild(option);
    }

    /**
     * Removes everything created by this class and shows the original select back
     */
    destroy() {
        this._div.innerHTML = '';
        this._div.parentElement.removeChild(this._div);
        this.show(this._originalSelect);
    }

    __scrollToIfIsNotVisible(parent, child) {
        // Where is the parent on page
        let parentRect = parent.getBoundingClientRect();

        // What can you see?
        let parentViewableArea = {
            height: parent.clientHeight,
            width: parent.clientWidth
        };

        // Where is the child
        let childRect = child.getBoundingClientRect();
        // console.log(childRect);
        // Is the child viewable?
        let isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

        // if you can't see the child try to scroll parent
        if (!isViewable) {


            // scroll by offset relative to parent
            //before scroll check if the bottom of child will be visible on next scroll
            if (parentRect.bottom - childRect.top < childRect.height) {
                parent.scrollTop = (childRect.bottom + parent.scrollTop) - parentRect.bottom
                // child.scrollIntoView(false);
            } else {

                parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top
                // child.scrollIntoView();
            }
        }
    }
}

let __tc = {
    ACTIVE: 'active',
    ITEM: 'list-group-item',
    LIST: 'list-group',
    INPUT: 'form-control',
    ICON: '___select-caret-down-icon',
    DIV_RESULTS: '___select-all-options',
};
Object.freeze(__tc);
