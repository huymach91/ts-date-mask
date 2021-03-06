export interface IDateMaskOptional {
  mask: 'mm/dd/yyyy' | 'dd/mm/yyyy';
}

export class DateMask {
  private keydownRef: any;
  private blurRef: any;

  private arrowKeys: Array<string> = ['ArrowLeft', 'ArrowRight'];
  private deleteKeys: Array<string> = ['Backspace', 'Delete'];
  private moveKeys: Array<string> = ['Home', 'End'];

  private display: string;
  private value: string;

  private maxCaretPosition: number;
  private delimiter: string = '/';

  constructor(
    private element: HTMLInputElement,
    private optional: IDateMaskOptional = {
      mask: 'dd/mm/yyyy',
    }
  ) {
    this.init();
  }

  private init() {
    this.keydownRef = this.keydown.bind(this);
    this.blurRef = this.blur.bind(this);
    this.element.addEventListener('keydown', this.keydownRef);
    this.element.addEventListener('blur', this.blurRef);
    this.element.addEventListener('inputChange', (event: any) => {
      console.log(event.detail);
    });
    this.display = this.optional.mask;
    this.element.value = this.display;
    this.maxCaretPosition = this.element.selectionEnd;
  }

  private keydown(event: any) {
    const key = event.key.toString();
    const element = this.element;
    const value = this.element.value;

    const isNumberKey = /\d/g.test(key);
    const isSelect = event.ctrlKey && key === 'a';
    const isCopy = event.ctrlKey && key === 'c';
    const isArrowKey = this.arrowKeys.includes(key);
    const isMoveKey = this.moveKeys.includes(key);
    const isDelete = this.deleteKeys.includes(key);

    const caret: number = element.selectionStart;
    const index: number = element.selectionStart - 1;
    const charAtCaret = value.charAt(caret);

    // case 1: not match any conditions below
    if (isSelect || isCopy || isArrowKey || isMoveKey) {
      return true;
    }

    // case 2: typing number
    if (isNumberKey && caret < this.maxCaretPosition) {
      let localCaret = caret;
      if (charAtCaret === this.delimiter) {
        localCaret += 1;
      }
      this.insertChar(localCaret, key);
    }

    // case 3: typing backspace
    if (isDelete && index >= 0 && caret <= this.maxCaretPosition) {
      const charAtCaretFromMask = this.optional.mask[index];
      if (charAtCaretFromMask === this.delimiter) {
        const previousIndex = index - 1;
        element.setRangeText(
          this.optional.mask[previousIndex],
          previousIndex,
          index
        );
        element.setSelectionRange(previousIndex, previousIndex);
      } else {
        element.setRangeText(charAtCaretFromMask, index, index + 1);
        element.setSelectionRange(index, index);
      }
    }

    // case 4: select all before delete to clear input
    if (
      isDelete &&
      element.selectionStart === 0 &&
      element.selectionEnd === this.maxCaretPosition
    ) {
      element.value = this.display;
    }

    event.preventDefault();
  }

  blur() {
    if (this.validate()) {
      const value = this.element.value;
      const format = value.replace(/\//g, '-');
      this.dispathChangeEvent({
        format: format,
        value: value,
      });
      return;
    }
    this.element.value = this.display;
  }

  private insertChar(position: number, insertValue: string) {
    this.element.setRangeText(insertValue, position, position + 1);
    this.element.setSelectionRange(position + 1, position + 1);
  }

  private validate() {
    const value = this.element.value;
    // case 1: valid format
    var date_regex =
      this.optional.mask === 'mm/dd/yyyy'
        ? /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/
        : /^(0[1-9]|1\d|2\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
    if (!date_regex.test(value)) {
      return false;
    }

    const dates = value.split(this.delimiter) as Array<string>;
    const year = +dates[2];
    const month = this.optional.mask === 'mm/dd/yyyy' ? +dates[0] : +dates[1];
    const daysInMonth = new Date(year, month, 0, 0, 0).getDate();
    const date = this.optional.mask === 'mm/dd/yyyy' ? +dates[1] : +dates[0];

    // case 2: date ceil
    if (date > daysInMonth) {
      return false;
    }

    return true;
  }

  private dispathChangeEvent(detail: any) {
    const customEvent = new CustomEvent('inputChange', { detail: detail });
    this.element.dispatchEvent(customEvent);
  }
}
