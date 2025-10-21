export interface IPrimaryButton {
    text: string;
    backgroundColor: string;
    disabled: boolean;
    width : number;
    height: number;
    action: () => void;
  }