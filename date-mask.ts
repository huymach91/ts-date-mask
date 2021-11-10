export interface IDateMaskOptional {
  mask: 'mm/dd/yyyy' | 'dd/mm/yyyy';
  delimiter: '/' | '-';
}

export class DateMask {
  private keydownRef: any;

  private arrowKeys: Array<string> = ['ArrowLeft', 'ArrowRight'];
  private removeKeys: Array<string> = ['Backspace', 'Delete'];
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
    this.element.addEventListener('keydown', this.keydownRef);
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
    const isRemoveKey = this.removeKeys.includes(key);
    const isMoveKey = this.moveKeys.includes(key);

    const caret: number = element.selectionStart;
    const charAtCaret = value.charAt(caret);

    // case 1: not match any conditions below
    if (isSelect || isCopy || isRemoveKey || isArrowKey || isMoveKey) {
      return true;
    }

    if (isNumberKey && caret < this.maxCaretPosition) {
      let localCaret = caret;
      if (charAtCaret === this.optional.delimiter) {
        localCaret += 1;
      }
      this.insertChar(localCaret, key);
    }

    event.preventDefault();
  }

  private insertChar(position: number, insertValue: string) {
    this.element.setRangeText(insertValue, position, position + 1);
    this.element.setSelectionRange(position + 1, position + 1);
  }
}
