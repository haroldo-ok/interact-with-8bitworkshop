"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disassemble6502 = exports.OPS_6502 = void 0;
var util_1 = require("../util");
exports.OPS_6502 = [
    { mn: "BRK", am: "", nb: 1, il: 0, c1: 7, c2: 0 },
    { mn: "ORA", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SLO", am: "(aa,x)", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa", nb: 2, il: 1, c1: 3, c2: 0 },
    { mn: "ORA", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "ASL", am: "aa", nb: 2, il: 0, c1: 5, c2: 0 },
    { mn: "SLO", am: "aa", nb: 2, il: 1, c1: 5, c2: 0 },
    { mn: "PHP", am: "", nb: 1, il: 0, c1: 3, c2: 0 },
    { mn: "ORA", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "ASL", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ANC", am: "#aa", nb: 2, il: 1, c1: 2, c2: 0 },
    { mn: "NOP", am: "AAAA", nb: 3, il: 1, c1: 4, c2: 0 },
    { mn: "ORA", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "ASL", am: "AAAA", nb: 3, il: 0, c1: 6, c2: 0 },
    { mn: "SLO", am: "AAAA", nb: 3, il: 1, c1: 6, c2: 0 },
    { mn: "BPL", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "ORA", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SLO", am: "(aa),y", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa,x", nb: 2, il: 1, c1: 4, c2: 0 },
    { mn: "ORA", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "ASL", am: "aa,x", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "SLO", am: "aa,x", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "CLC", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ORA", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "NOP", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SLO", am: "AAAA,y", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "AAAA,x", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "ORA", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "ASL", am: "AAAA,x", nb: 3, il: 0, c1: 7, c2: 0 },
    { mn: "SLO", am: "AAAA,x", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "JSR", am: "AAAA", nb: 3, il: 0, c1: 6, c2: 0 },
    { mn: "AND", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "RLA", am: "(aa,x)", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "BIT", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "AND", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "ROL", am: "aa", nb: 2, il: 0, c1: 5, c2: 0 },
    { mn: "RLA", am: "aa", nb: 2, il: 1, c1: 5, c2: 0 },
    { mn: "PLP", am: "", nb: 1, il: 0, c1: 4, c2: 0 },
    { mn: "AND", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "ROL", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ANC", am: "#aa", nb: 2, il: 1, c1: 2, c2: 0 },
    { mn: "BIT", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "AND", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "ROL", am: "AAAA", nb: 3, il: 0, c1: 6, c2: 0 },
    { mn: "RLA", am: "AAAA", nb: 3, il: 1, c1: 6, c2: 0 },
    { mn: "BMI", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "AND", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "RLA", am: "(aa),y", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa,x", nb: 2, il: 1, c1: 4, c2: 0 },
    { mn: "AND", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "ROL", am: "aa,x", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "RLA", am: "aa,x", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "SEC", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "AND", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "NOP", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "RLA", am: "AAAA,y", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "AAAA,x", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "AND", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "ROL", am: "AAAA,x", nb: 3, il: 0, c1: 7, c2: 0 },
    { mn: "RLA", am: "AAAA,x", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "RTI", am: "", nb: 1, il: 0, c1: 6, c2: 0 },
    { mn: "EOR", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SRE", am: "(aa,x)", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa", nb: 2, il: 1, c1: 3, c2: 0 },
    { mn: "EOR", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "LSR", am: "aa", nb: 2, il: 0, c1: 5, c2: 0 },
    { mn: "SRE", am: "aa", nb: 2, il: 1, c1: 5, c2: 0 },
    { mn: "PHA", am: "", nb: 1, il: 0, c1: 3, c2: 0 },
    { mn: "EOR", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "LSR", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ASR", am: "#aa", nb: 2, il: 1, c1: 2, c2: 0 },
    { mn: "JMP", am: "AAAA", nb: 3, il: 0, c1: 3, c2: 0 },
    { mn: "EOR", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "LSR", am: "AAAA", nb: 3, il: 0, c1: 6, c2: 0 },
    { mn: "SRE", am: "AAAA", nb: 3, il: 1, c1: 6, c2: 0 },
    { mn: "BVC", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "EOR", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SRE", am: "(aa),y", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa,x", nb: 2, il: 1, c1: 4, c2: 0 },
    { mn: "EOR", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "LSR", am: "aa,x", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "SRE", am: "aa,x", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "CLI", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "EOR", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "NOP", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SRE", am: "AAAA,y", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "AAAA,x", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "EOR", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "LSR", am: "AAAA,x", nb: 3, il: 0, c1: 7, c2: 0 },
    { mn: "SRE", am: "AAAA,x", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "RTS", am: "", nb: 1, il: 0, c1: 6, c2: 0 },
    { mn: "ADC", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "RRA", am: "(aa,x)", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa", nb: 2, il: 1, c1: 3, c2: 0 },
    { mn: "ADC", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "ROR", am: "aa", nb: 2, il: 0, c1: 5, c2: 0 },
    { mn: "RRA", am: "aa", nb: 2, il: 1, c1: 5, c2: 0 },
    { mn: "PLA", am: "", nb: 1, il: 0, c1: 4, c2: 0 },
    { mn: "ADC", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "ROR", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ARR", am: "#aa", nb: 2, il: 1, c1: 2, c2: 0 },
    { mn: "JMP", am: "(AAAA)", nb: 3, il: 0, c1: 5, c2: 0 },
    { mn: "ADC", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "ROR", am: "AAAA", nb: 3, il: 0, c1: 6, c2: 0 },
    { mn: "RRA", am: "AAAA", nb: 3, il: 1, c1: 6, c2: 0 },
    { mn: "BVS", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "ADC", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "RRA", am: "(aa),y", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa,x", nb: 2, il: 1, c1: 4, c2: 0 },
    { mn: "ADC", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "ROR", am: "aa,x", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "RRA", am: "aa,x", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "SEI", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ADC", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "NOP", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "RRA", am: "AAAA,y", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "AAAA,x", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "ADC", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "ROR", am: "AAAA,x", nb: 3, il: 0, c1: 7, c2: 0 },
    { mn: "RRA", am: "AAAA,x", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "STA", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "NOP", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "SAX", am: "(aa,x)", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "STY", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "STA", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "STX", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "SAX", am: "aa", nb: 2, il: 1, c1: 3, c2: 0 },
    { mn: "DEY", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "NOP", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "TXA", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "ANE", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "STY", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "STA", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "STX", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "SAX", am: "AAAA", nb: 3, il: 1, c1: 4, c2: 0 },
    { mn: "BCC", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "STA", am: "(aa),y", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "SHA", am: "(aa),y", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "STY", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "STA", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "STX", am: "aa,y", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "SAX", am: "aa,y", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "TYA", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "STA", am: "AAAA,y", nb: 3, il: 0, c1: 5, c2: 0 },
    { mn: "TXS", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "SHS", am: "AAAA,y", nb: 3, il: 1, c1: 0, c2: 0 },
    { mn: "SHY", am: "AAAA,x", nb: 3, il: 1, c1: 0, c2: 0 },
    { mn: "STA", am: "AAAA,x", nb: 3, il: 0, c1: 5, c2: 0 },
    { mn: "SHX", am: "AAAA,y", nb: 3, il: 1, c1: 0, c2: 0 },
    { mn: "SHA", am: "AAAA,y", nb: 3, il: 1, c1: 0, c2: 0 },
    { mn: "LDY", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "LDA", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "LDX", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "LAX", am: "(aa,x)", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "LDY", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "LDA", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "LDX", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "LAX", am: "aa", nb: 2, il: 1, c1: 3, c2: 0 },
    { mn: "TAY", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "LDA", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "TAX", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "LXA", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "LDY", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "LDA", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "LDX", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "LAX", am: "AAAA", nb: 3, il: 1, c1: 4, c2: 0 },
    { mn: "BCS", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "LDA", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "LAX", am: "(aa),y", nb: 2, il: 1, c1: 5, c2: 1 },
    { mn: "LDY", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "LDA", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "LDX", am: "aa,y", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "LAX", am: "aa,y", nb: 2, il: 1, c1: 4, c2: 1 },
    { mn: "CLV", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "LDA", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "TSX", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "LAS", am: "AAAA,y", nb: 3, il: 1, c1: 0, c2: 0 },
    { mn: "LDY", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "LDA", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "LDX", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "LAX", am: "AAAA,y", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "CPY", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "CMP", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "NOP", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "DCP", am: "(aa,x)", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "CPY", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "CMP", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "DEC", am: "aa", nb: 2, il: 0, c1: 5, c2: 0 },
    { mn: "DCP", am: "aa", nb: 2, il: 1, c1: 5, c2: 0 },
    { mn: "INY", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "CMP", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "DEX", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "SBX", am: "#aa", nb: 2, il: 1, c1: 2, c2: 0 },
    { mn: "CPY", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "CMP", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "DEC", am: "AAAA", nb: 3, il: 0, c1: 3, c2: 0 },
    { mn: "DCP", am: "AAAA", nb: 3, il: 1, c1: 6, c2: 0 },
    { mn: "BNE", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "CMP", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "DCP", am: "(aa),y", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa,x", nb: 2, il: 1, c1: 4, c2: 0 },
    { mn: "CMP", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "DEC", am: "aa,x", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "DCP", am: "aa,x", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "CLD", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "CMP", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "NOP", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "DCP", am: "AAAA,y", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "AAAA,x", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "CMP", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "DEC", am: "AAAA,x", nb: 3, il: 0, c1: 7, c2: 0 },
    { mn: "DCP", am: "AAAA,x", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "CPX", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "SBC", am: "(aa,x)", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "NOP", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "ISB", am: "(aa,x)", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "CPX", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "SBC", am: "aa", nb: 2, il: 0, c1: 3, c2: 0 },
    { mn: "INC", am: "aa", nb: 2, il: 0, c1: 5, c2: 0 },
    { mn: "ISB", am: "aa", nb: 2, il: 1, c1: 5, c2: 0 },
    { mn: "INX", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "SBC", am: "#aa", nb: 2, il: 0, c1: 2, c2: 0 },
    { mn: "NOP", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "SBC", am: "#aa", nb: 2, il: 1, c1: 0, c2: 0 },
    { mn: "CPX", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "SBC", am: "AAAA", nb: 3, il: 0, c1: 4, c2: 0 },
    { mn: "INC", am: "AAAA", nb: 3, il: 0, c1: 6, c2: 0 },
    { mn: "ISB", am: "AAAA", nb: 3, il: 1, c1: 6, c2: 0 },
    { mn: "BEQ", am: "branch", nb: 2, il: 0, c1: 2, c2: 2 },
    { mn: "SBC", am: "(aa),y", nb: 2, il: 0, c1: 5, c2: 1 },
    { mn: "KIL", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "ISB", am: "(aa),y", nb: 2, il: 1, c1: 8, c2: 1 },
    { mn: "NOP", am: "aa,x", nb: 2, il: 1, c1: 4, c2: 0 },
    { mn: "SBC", am: "aa,x", nb: 2, il: 0, c1: 4, c2: 0 },
    { mn: "INC", am: "aa,x", nb: 2, il: 0, c1: 6, c2: 0 },
    { mn: "ISB", am: "aa,x", nb: 2, il: 1, c1: 6, c2: 1 },
    { mn: "SED", am: "", nb: 1, il: 0, c1: 2, c2: 0 },
    { mn: "SBC", am: "AAAA,y", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "NOP", am: "", nb: 1, il: 1, c1: 0, c2: 0 },
    { mn: "ISB", am: "AAAA,y", nb: 3, il: 1, c1: 7, c2: 1 },
    { mn: "NOP", am: "AAAA,x", nb: 3, il: 1, c1: 4, c2: 1 },
    { mn: "SBC", am: "AAAA,x", nb: 3, il: 0, c1: 4, c2: 1 },
    { mn: "INC", am: "AAAA,x", nb: 3, il: 0, c1: 7, c2: 0 },
    { mn: "ISB", am: "AAAA,x", nb: 3, il: 1, c1: 7, c2: 1 },
];
function disassemble6502(pc, b0, b1, b2) {
    var op = exports.OPS_6502[b0];
    var s = op.mn;
    var am = op.am;
    var isaddr = false;
    if (am == 'branch') {
        var offset = (b1 < 0x80) ? (pc + 2 + b1) : (pc + 2 - (256 - b1));
        offset &= 0xffff;
        am = '$' + util_1.hex(offset, 4);
        isaddr = true;
    }
    else {
        am = am.replace('aa', '$' + util_1.hex(b1, 2));
        am = am.replace('AAAA', '$' + util_1.hex(b1 + (b2 << 8), 4));
        if (am.indexOf('#') < 0 && am.indexOf('$') >= 0)
            isaddr = true;
    }
    return { line: op.mn + " " + am, nbytes: op.nb, isaddr: isaddr };
}
exports.disassemble6502 = disassemble6502;
;
//# sourceMappingURL=disasm6502.js.map