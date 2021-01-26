declare type V2JS_Var = {
    wordlen: number;
    name: string;
    len: number;
    ofs: number;
    arrdim?: number[];
};
declare type V2JS_Code = {
    name: string;
    ports: V2JS_Var[];
    signals: V2JS_Var[];
    funcs: string[];
};
declare type V2JS_Output = {
    output: {
        code: V2JS_Code;
        name: string;
        ports: V2JS_Var[];
        signals: V2JS_Var[];
    };
};
declare function translateVerilatorOutputToJS(htext: string, cpptext: string): {
    output: {
        code: string;
        name: string;
        ports: any[];
        signals: any[];
    };
};
