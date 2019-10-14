# Seletix
Smart select with no dependencies.

### Usage
```js
new Seletix('id_element', options);
```

### Options
Options avaiable:
- **delay**:
 Amout of time in miliseconds to wait before search.
Every time a user enter a new letter with a keybord this time starts again. This prevent search on every letter wrote by user. Default: 400

- **limit**:
Max of results to show.
Default is 10.

- **minLength**:
Minimum of characters to start filter results.
Default is 2

- **showCaret**: 
If is true the icon caret will be shown in the right conner of input.
Default: true

- **source**:
You can use a url string
```js
new Seletix('movies', {
    source: 'http://yoursite.com/resource-example'
});
```

Or you can use a function that return an array with objects

```js
new Seletix('movies', {
    source: function() {
        return [
            {id: 1, label:'Movie 1'},
            {id: 2, label:'Movie 2'},
        ];
    }
});
```
