import { WorkerError, CodeListingMap, SourceLocation, SourceLine } from "../workertypes";
export interface BASICOptions {
    dialectName: string;
    asciiOnly: boolean;
    uppercaseOnly: boolean;
    optionalLabels: boolean;
    optionalWhitespace: boolean;
    multipleStmtsPerLine: boolean;
    varNaming: 'A' | 'A1' | 'A1$' | 'AA' | '*';
    squareBrackets: boolean;
    tickComments: boolean;
    hexOctalConsts: boolean;
    optionalLet: boolean;
    chainAssignments: boolean;
    validKeywords: string[];
    validFunctions: string[];
    validOperators: string[];
    defaultValues: boolean;
    stringConcat: boolean;
    checkOverflow: boolean;
    bitwiseLogic: boolean;
    maxStringLength: number;
    maxDefArgs: number;
    staticArrays: boolean;
    sharedArrayNamespace: boolean;
    defaultArrayBase: number;
    defaultArraySize: number;
    maxDimensions: number;
    arraysContainChars: boolean;
    printZoneLength: number;
    numericPadding: boolean;
    compiledBlocks: boolean;
    testInitialFor: boolean;
    optionalNextVar: boolean;
    multipleNextVars: boolean;
    checkOnGotoIndex: boolean;
    computedGoto: boolean;
    restoreWithLabel: boolean;
    endStmtRequired: boolean;
    multilineIfThen?: boolean;
    commandsPerSec?: number;
    maxLinesPerFile?: number;
    maxArrayElements?: number;
}
export interface SourceLocated {
    $loc?: SourceLocation;
}
export interface SourceLineLocated {
    $loc?: SourceLine;
}
export declare class CompileError extends Error {
    $loc: SourceLocation;
    constructor(msg: string, loc: SourceLocation);
}
export declare enum TokenType {
    EOL = 0,
    Float = 1,
    Int = 2,
    HexOctalInt = 3,
    Remark = 4,
    Ident = 5,
    String = 6,
    Relational = 7,
    DoubleStar = 8,
    Operator = 9,
    CatchAll = 10,
    Whitespace = 11,
    _LAST = 12
}
export declare type ExprTypes = BinOp | UnOp | IndOp | Literal;
export declare type Expr = ExprTypes;
export declare type Opcode = string;
export declare type Value = number | string;
export declare type ValueType = 'number' | 'string' | 'label';
export interface ExprBase extends SourceLocated {
    valtype: ValueType;
}
export interface Literal extends ExprBase {
    value: Value;
}
export interface BinOp extends ExprBase {
    op: Opcode;
    left: Expr;
    right: Expr;
}
export interface UnOp extends ExprBase {
    op: 'neg' | 'lnot' | 'bnot';
    expr: Expr;
}
export interface IndOp extends ExprBase {
    name: string;
    args: Expr[];
}
export interface Statement extends SourceLineLocated {
    command: string;
}
export interface ScopeStartStatement extends Statement {
    endpc?: number;
}
export interface ScopeEndStatement extends Statement {
    startpc?: number;
}
export interface PRINT_Statement extends Statement {
    command: "PRINT";
    args: Expr[];
}
export interface LET_Statement extends Statement {
    command: "LET";
    lexprs: IndOp[];
    right: Expr;
}
export interface DIM_Statement extends Statement {
    command: "DIM";
    args: IndOp[];
}
export interface GOTO_Statement extends Statement {
    command: "GOTO";
    label: Expr;
}
export interface GOSUB_Statement extends Statement {
    command: "GOSUB";
    label: Expr;
}
export interface RETURN_Statement extends Statement {
    command: "RETURN";
}
export interface ONGO_Statement extends Statement {
    command: "ONGOTO" | "ONGOSUB";
    expr: Expr;
    labels: Expr[];
}
export interface IF_Statement extends ScopeStartStatement {
    command: "IF";
    cond: Expr;
}
export interface ELSE_Statement extends ScopeStartStatement {
    command: "ELSE";
}
export interface FOR_Statement extends ScopeStartStatement {
    command: "FOR";
    lexpr: IndOp;
    initial: Expr;
    target: Expr;
    step?: Expr;
}
export interface NEXT_Statement extends ScopeEndStatement {
    command: "NEXT";
    lexpr?: IndOp;
}
export interface WHILE_Statement extends ScopeStartStatement {
    command: "WHILE";
    cond: Expr;
}
export interface WEND_Statement extends ScopeEndStatement {
    command: "WEND";
}
export interface END_Statement extends ScopeEndStatement {
    command: "END";
}
export interface INPUT_Statement extends Statement {
    command: "INPUT";
    prompt: Expr;
    args: IndOp[];
    timeout?: Expr;
    elapsed?: IndOp;
}
export interface ENTER_Statement extends INPUT_Statement {
    timeout: Expr;
    elapsed: IndOp;
}
export interface DATA_Statement extends Statement {
    command: "DATA";
    datums: Literal[];
}
export interface READ_Statement extends Statement {
    command: "READ";
    args: IndOp[];
}
export interface RESTORE_Statement extends Statement {
    command: "RESTORE";
    label: Expr;
}
export interface DEF_Statement extends Statement {
    command: "DEF";
    lexpr: IndOp;
    def: Expr;
}
export interface SUB_Statement extends ScopeStartStatement {
    command: "SUB";
    lexpr: IndOp;
}
export interface CALL_Statement {
    command: "CALL";
    call: IndOp;
}
export interface OPTION_Statement extends Statement {
    command: "OPTION";
    optname: string;
    optargs: string[];
}
export interface GET_Statement extends Statement {
    command: "GET";
    lexpr: IndOp;
}
export interface CHANGE_Statement extends Statement {
    command: "CHANGE";
    src: Expr;
    dest: IndOp;
}
export interface CONVERT_Statement extends Statement {
    command: "CONVERT";
    src: Expr;
    dest: IndOp;
}
export interface NoArgStatement extends Statement {
    command: string;
}
export interface BASICProgram {
    opts: BASICOptions;
    stmts: Statement[];
    labels: {
        [label: string]: number;
    };
}
declare class Token implements SourceLocated {
    str: string;
    type: TokenType;
    $loc: SourceLocation;
}
export declare class BASICParser {
    opts: BASICOptions;
    optionCount: number;
    maxlinelen: number;
    stmts: Statement[];
    errors: WorkerError[];
    listings: CodeListingMap;
    labels: {
        [label: string]: number;
    };
    targets: {
        [targetlabel: string]: SourceLocation;
    };
    vardefs: {
        [name: string]: IndOp;
    };
    varrefs: {
        [name: string]: SourceLocation;
    };
    fnrefs: {
        [name: string]: string[];
    };
    scopestack: number[];
    elseifcount: number;
    path: string;
    lineno: number;
    tokens: Token[];
    eol: Token;
    curlabel: string;
    lasttoken: Token;
    constructor();
    addError(msg: string, loc?: SourceLocation): void;
    compileError(msg: string, loc?: SourceLocation, loc2?: SourceLocation): void;
    dialectError(what: string, loc?: SourceLocation): void;
    dialectErrorNoSupport(what: string, loc?: SourceLocation): void;
    consumeToken(): Token;
    expectToken(str: string, msg?: string): Token;
    expectTokens(strlist: string[], msg?: string): Token;
    peekToken(lookahead?: number): Token;
    pushbackToken(tok: Token): void;
    parseOptLabel(): void;
    getPC(): number;
    addStatement(stmt: Statement, cmdtok: Token, endtok?: Token): void;
    addLabel(str: string, offset?: number): void;
    parseFile(file: string, path: string): BASICProgram;
    parseLine(line: string): void;
    _tokenize(line: string): void;
    tokenize(line: string): void;
    parse(): void;
    parseCompoundStatement(): void;
    validKeyword(keyword: string): string;
    validFunction(funcname: string): string;
    supportsCommand(cmd: string): () => Statement;
    parseStatement(): Statement | null;
    modifyScope(stmt: Statement): void;
    popScope(close: WEND_Statement | NEXT_Statement | END_Statement, open: string): void;
    popIfThenScope(nextpc?: number): void;
    parseVarSubscriptOrFunc(): IndOp;
    parseLexpr(): IndOp;
    parseForNextLexpr(): IndOp;
    parseList<T>(parseFunc: () => T, delim: string): T[];
    parseLexprList(): IndOp[];
    parseExprList(): Expr[];
    parseLabelList(): Expr[];
    parseLabel(): Expr;
    parseDatumList(): Literal[];
    parseDatum(): Literal;
    parseValue(tok: Token): Literal;
    parsePrimary(): Expr;
    parseNumber(str: string): number;
    parseExpr1(left: Expr, minPred: number): Expr;
    parseExpr(): Expr;
    parseExprWithType(expecttype: ValueType): Expr;
    validateVarName(lexpr: IndOp): void;
    visitExpr(expr: Expr, callback: (expr: Expr) => void): void;
    exprTypeForOp(fnname: string, left: Expr, right: Expr, optok: Token): ValueType;
    exprTypeForSubscript(fnname: string, args: Expr[], loc: SourceLocation): ValueType;
    stmt__LET(): LET_Statement;
    stmt__PRINT(): PRINT_Statement;
    stmt__GOTO(): GOTO_Statement | GOSUB_Statement | ONGO_Statement;
    stmt__GOSUB(): GOTO_Statement | GOSUB_Statement | ONGO_Statement;
    __GO(cmd: "GOTO" | "GOSUB"): GOTO_Statement | GOSUB_Statement | ONGO_Statement;
    stmt__IF(): void;
    stmt__ELSE(): void;
    parseGotoOrStatements(): void;
    stmt__FOR(): FOR_Statement;
    stmt__NEXT(): NEXT_Statement;
    stmt__WHILE(): WHILE_Statement;
    stmt__WEND(): WEND_Statement;
    stmt__DIM(): DIM_Statement;
    stmt__INPUT(): INPUT_Statement;
    stmt__ENTER(): INPUT_Statement;
    stmt__DATA(): DATA_Statement;
    stmt__READ(): READ_Statement;
    stmt__RESTORE(): RESTORE_Statement;
    stmt__RETURN(): {
        command: string;
    };
    stmt__STOP(): {
        command: string;
    };
    stmt__END(): {
        command: string;
    };
    stmt__ON(): ONGO_Statement;
    stmt__DEF(): DEF_Statement;
    stmt__SUB(): SUB_Statement;
    stmt__CALL(): CALL_Statement;
    markVarDefs(lexpr: IndOp): void;
    checkCallGraph(name: string, visited: Set<string>): void;
    stmt__POP(): NoArgStatement;
    stmt__GET(): GET_Statement;
    stmt__CLEAR(): NoArgStatement;
    stmt__RANDOMIZE(): NoArgStatement;
    stmt__CHANGE(): CHANGE_Statement;
    stmt__CONVERT(): CONVERT_Statement;
    stmt__OPTION(): OPTION_Statement;
    generateListing(file: string, program: BASICProgram): {
        lines: any[];
    };
    getListings(): CodeListingMap;
    checkAll(program: BASICProgram): void;
    checkLabels(): void;
    checkScopes(): void;
    checkVarRefs(): void;
}
export declare const ECMA55_MINIMAL: BASICOptions;
export declare const DARTMOUTH_4TH_EDITION: BASICOptions;
export declare const TINY_BASIC: BASICOptions;
export declare const HP_TIMESHARED_BASIC: BASICOptions;
export declare const DEC_BASIC_11: BASICOptions;
export declare const DEC_BASIC_PLUS: BASICOptions;
export declare const BASICODE: BASICOptions;
export declare const ALTAIR_BASIC41: BASICOptions;
export declare const APPLESOFT_BASIC: BASICOptions;
export declare const BASIC80: BASICOptions;
export declare const MODERN_BASIC: BASICOptions;
export declare const DIALECTS: {
    DEFAULT: BASICOptions;
    DARTMOUTH: BASICOptions;
    DARTMOUTH4: BASICOptions;
    ALTAIR: BASICOptions;
    ALTAIR4: BASICOptions;
    ALTAIR41: BASICOptions;
    TINY: BASICOptions;
    ECMA55: BASICOptions;
    MINIMAL: BASICOptions;
    HP: BASICOptions;
    HPB: BASICOptions;
    HPTSB: BASICOptions;
    HP2000: BASICOptions;
    HPBASIC: BASICOptions;
    HPACCESS: BASICOptions;
    DEC11: BASICOptions;
    DEC: BASICOptions;
    DECPLUS: BASICOptions;
    BASICPLUS: BASICOptions;
    BASICODE: BASICOptions;
    APPLESOFT: BASICOptions;
    BASIC80: BASICOptions;
    MODERN: BASICOptions;
};
export {};
