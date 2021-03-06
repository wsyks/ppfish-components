/**
 * Custom module for quilljs to allow user to drag images from their file system into the editor
 * and paste images from clipboard (Works on Chrome, Firefox, Edge, not on Safari)
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
export default class ImageDrop {

	/**
	 * Instantiate the module given a quill instance and any options
	 * @param {Quill} quill
	 * @param {Object} options
	 */
	constructor(quill, options = {}) {
		// save the quill reference
		this.quill = quill;
		this.customDropImage = options.customDropImage || null;
		// bind handlers to this instance
		this.handleDrop = this.handleDrop.bind(this);
		this.handlePaste = this.handlePaste.bind(this);
		// listen for drop and paste events
		this.quill.root.addEventListener('drop', this.handleDrop, false);
		this.quill.root.addEventListener('paste', this.handlePaste, false);
	}

	/**
	 * Handler for drop event to read dropped files from evt.dataTransfer
	 * @param {Event} evt
	 */
	handleDrop(evt) {
		evt.preventDefault();
		if (evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files.length) {
			if (document.caretRangeFromPoint) {
				const selection = document.getSelection();
				const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
				if (selection && range) {
					selection.setBaseAndExtent(
						range.startContainer, range.startOffset,
						range.startContainer, range.startOffset
					);
				}
			}

			if (this.customDropImage && typeof this.customDropImage == 'function') {
				this.customDropImage(evt.dataTransfer.files, this.insert.bind(this));
			} else {
				this.readFiles(evt.dataTransfer.files, this.insert.bind(this));
			}
		}
	}

	/**
	 * Handler for paste event to read pasted files from evt.clipboardData
	 * @param {Event} evt
	 */
	handlePaste(evt) {
		if (evt.clipboardData && evt.clipboardData.items && evt.clipboardData.items.length) {
			if (this.customDropImage && typeof this.customDropImage == 'function') {
				this.customDropImage(evt.clipboardData.items, this.insert.bind(this));
			} else {
				this.readFiles(evt.clipboardData.items, (attrs) => {
					// wait until after the paste when this.quill.getSelection() will return a valid index
					setTimeout(() => this.insert(attrs), 0);

					// const selection = this.quill.getSelection();
					// if (selection) {
					// 	// we must be in a browser that supports pasting (like Firefox)
					// 	// so it has already been placed into the editor
					// }
					// else {
					// 	// otherwise we wait until after the paste when this.quill.getSelection()
					// 	// will return a valid index
					// 	setTimeout(() => this.insert(dataUrl), 0);
					// }
				});
			}
		}
	}

	insert(attrs) {
		const range = this.quill.getSelection() || {},
			index = (range.index != undefined) ? range.index : this.quill.getLength();

		if (!attrs.src) return;

		this.quill.insertEmbed(index, 'myImage', attrs);
		// this.quill.insertEmbed(index, 'image', dataUrl, 'user');
		this.quill.setSelection(index + 1);
	}

	/**
	 * Extract image URIs a list of files from evt.dataTransfer or evt.clipboardData
	 * @param {File[]} files  One or more File objects
	 * @param {Function} callback  A function to send each data URI to
	 */
	readFiles(files, callback) {
		// check each file for an image
		[].forEach.call(files, file => {
			if (!file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i)) {
				// file is not an image
				// Note that some file formats such as psd start with image/* but are not readable
				return;
			}
			// set up file reader
			const reader = new FileReader();
			reader.onload = (evt) => {
				callback({
					src: evt.target.result
				});
			};
			// read the clipboard item or file
			const blob = file.getAsFile ? file.getAsFile() : file;
			if (blob instanceof Blob) {
				reader.readAsDataURL(blob);
			}
		});
	}
}
