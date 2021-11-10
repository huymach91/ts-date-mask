export interface IDateMaskOptional {
  mask: 'mm/dd/yyyy' | 'dd/mm/yyyy';
  delimiter: '/' | '-';
}

export class DateMask {
  private keydownRef: any;
  private blurRef: any;

  private arrowKeys: Array<string> = ['ArrowLeft', 'ArrowRight'];
  private moveKeys: Array<string> = ['Home', 'End'];

  private display: string;
  private value: string;

  private maxCaretPosition: number;

  constructor(
    private element: HTMLInputElement,
    private optional: IDateMaskOptional = {
      mask: 'mm/dd/yyyy',
      delimiter: '/',
    }
  ) {
    this.init();
  }

  private init() {
    this.keydownRef = this.keydown.bind(this);
    this.blurRef = this.blur.bind(this);
    this.element.addEventListener('keydown', this.keydownRef);
    this.element.addEventListener('blur', this.blurRef);
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
      if (charAtCaret === this.optional.delimiter) {
        localCaret += 1;
      }
      this.insertChar(localCaret, key);
    }

    // case 3: typing backspace
    if (key === 'Backspace' && index >= 0) {
      const charAtCaretFromMask = this.optional.mask[index];
      if (charAtCaretFromMask === this.optional.delimiter) {
        const backIndex = index - 1;
        this.element.setRangeText(
          this.optional.mask[backIndex],
          backIndex,
          index
        );
        this.element.setSelectionRange(backIndex, backIndex);
      } else {
        this.element.setRangeText(charAtCaretFromMask, index, index + 1);
        this.element.setSelectionRange(index, index);
      }
    }

    // case 4: typing delete
    if (key === 'Delete') {
      const charAtCaretFromMask = this.optional.mask[caret];
      if (charAtCaretFromMask !== this.optional.delimiter) {
        this.insertChar(caret, charAtCaretFromMask);
      } else {
        this.element.setSelectionRange(caret + 1, caret + 1);
      }
    }

    event.preventDefault();
  }

  blur() {
    console.log(this.validate());
  }

  private insertChar(position: number, insertValue: string) {
    this.element.setRangeText(insertValue, position, position + 1);
    this.element.setSelectionRange(position + 1, position + 1);
  }

  private validate() {
    const value = this.element.value;
    if (this.optional.mask === 'mm/dd/yyyy') {
      return new Date(value).toString() === 'Invalid Date' ? false : true;
    }
    const dates = value.split(this.optional.delimiter) as Array<string>;
    const year = +dates[2];
    const month = +dates[1];
    const date = +dates[0];
    return new Date(year, month, date).toString() === 'Invalid Date';
  }
}
