export type ButtonInfo = {
    name: string;
    methodToCall: () => Promise<void>;
};

export type Row = {
    title: string;
    guard?: 'newWalletCreated';
    buttons: ButtonInfo[];
};