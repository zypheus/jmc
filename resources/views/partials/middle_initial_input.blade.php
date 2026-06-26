@props([
    'name' => 'middle_initial',
    'value' => '',
    'id' => null,
    'class' => 'form-control',
    'placeholder' => 'M.I.',
    'required' => false,
])

<input type="text"
       name="{{ $name }}"
       @if($id) id="{{ $id }}" @endif
       class="{{ $class }}"
       maxlength="1"
       autocomplete="off"
       spellcheck="false"
       placeholder="{{ $placeholder }}"
       value="{{ $value }}"
       oninput="this.value=this.value.replace(/[^A-Za-z]/g,'').slice(0,1)"
       @if($required) required @endif>
