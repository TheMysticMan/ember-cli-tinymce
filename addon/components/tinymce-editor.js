/*global tinymce */
import Ember from 'ember';
const {observer, on, run} = Ember;

export default Ember.Component.extend({
  editor: undefined,
  tagName: 'textarea',
  _contentChangedListener: null,

  // Change the editor content if value changes
  valueChanged: observer('value', function() {
    let editor = this.get('editor');
    if (editor && editor.getContent() !== this.get('value')) {
      editor.setContent(this.get('value') || '');
    }
  }),

  // Default implementation which will update the value. 
  // To follow DDAU guidlines you can override this method by defining the action onValueChanged=(action "yourMethod")
  onValueChanged(value) {
    this.set('value', value);
  },

  // Call onValueChanged if editor content changes
  contentChanged(editor) {
    this.onValueChanged(editor.getContent());
  },

  //Bind events to function
  setEvents: observer('editor', function() {
    let editor = this.get('editor');

    this._contentChangedListener = run.bind(this, ()=> {
      run.debounce(this, this.contentChanged, editor, 1);
    });

    editor.on('change keyup keydown keypress mousedown', this._contentChangedListener);
  }),

  // Initialize tinymce
  initTiny: on('didInsertElement', observer('options', function() {
    let {options, editor} = this.getProperties('options', 'editor');

    let customOptions = {
      selector: `#${this.get('elementId')}`,
      init_instance_callback : (editor) => {
        this.set('editor', editor);
        this.get('editor').setContent(this.get('value') || ''); //Set content with default text
      },
    };

    if (editor){
      editor.destroy();
    }

    tinymce.init(Ember.$.extend( customOptions, options ));
  })),

  // Destroy tinymce editor instance when editor is removed from the page.  Otherwise, it won't be
  // created again when added back to the page (i.e. navigating away from and back to the route).
  cleanUp: on('willDestroyElement', function() {
    let editor = this.get('editor');
    if (editor) {
      editor.off('change keyup keydown keypress mousedown', this._contentChangedListener);
      editor.destroy();
    }
  })
});
