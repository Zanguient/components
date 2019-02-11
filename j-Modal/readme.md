## j-Modal

Is a simple alternative to `j-Form`.

- Works only with `+v17` [jComponent](http://jcomponent.org)
- __Download__ [jComponent with Tangular (jcta.min.js)](https://github.com/petersirka/jComponent)
- Works with Bootstrap
- The component moves the content of this component under `<body>` tag (because of positioning)

__Configuration__:

- `title` {String} modal title (it replaces a `HTML` in label element in the header)
- `width` {Number} modal max-width
- `if` {String} condition for showing of the modal, it's compared with the value within of `data-jc-path`
- `icon` {String} Font-Awesome icon without `fa-`
- `reload` {String} link to a global function and it's executed if the form is showing
- `submit` {String} link to a global function and it's executed if the submit button is pressed
- `cancel` {String} link to a global function and it's executed if the cancel button is pressed
- `enter` {Boolean} optional, captures `enter` key automatically and performs submit (default: `false`)
- `center` {Boolean} optional, centers the form to middle of screen
- `autofocus` {Boolean/String} optional, can focus an input. `String` === `jQuery selector` for the input
- `default` {String} optional, a short alias for `DEFAULT(default, true)`
- `zindex` {Number} optional, can affect z-index (default: `12`)
- `align` {Number} optional, aligns modal `0` centered (default), `1` right bottom, `2` left bottom, `3` left top, `4` right top

__Good to know__:

The content of the `j-Modal` is divided to 3 parts: `header`, `body` and `footer`. Each part must be defined. The component adds CSS classes to each part, for example first `div` will contain `ui-modal-header`, second `ui-modal-body` and third `ui-modal-footer`.

---

This component supports dynamic evaluation of the content of `<script type="text/html">`. The example below contains a script with HTML and the component evaluates the content if the j-Modal will be displayed (only once).

```html
<div data-jc="modal__path__config">
	<script type="text/html">
		A CONTENT
	</script>
</div>
```

### Author

- Peter Širka <petersirka@gmail.com>
- License: MIT