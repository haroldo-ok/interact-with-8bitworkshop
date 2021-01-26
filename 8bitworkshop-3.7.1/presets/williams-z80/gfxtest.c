
#include <string.h>

typedef unsigned char byte;
typedef unsigned short word;

byte __at (0xc000) palette[16];
volatile byte __at (0xc800) input0;
volatile byte __at (0xc802) input1;
volatile byte __at (0xc804) input2;
byte __at (0xc900) rom_select;
volatile byte __at (0xcb00) video_counter;
byte __at (0xcbff) watchdog0x39;
byte __at (0xcc00) nvram[0x400];

// blitter flags
#define SRCSCREEN 0x1
#define DSTSCREEN 0x2
#define ESYNC 0x4
#define FGONLY 0x8
#define SOLID 0x10
#define RSHIFT 0x20
#define EVENONLY 0x40
#define ODDONLY 0x80

struct {
  byte flags;
  byte solid;
  word sstart;
  word dstart;
  byte width;
  byte height;
} __at (0xca00) blitter;

byte __at (0x0) vidmem[152][256]; // 256x304x4bpp video memory

void main();

// start routine @ 0x0
// set stack pointer, enable interrupts
void start() {
__asm
        LD      SP,#0xc000
        DI
__endasm;
        main();
}

#define LOCHAR 0x21
#define HICHAR 0x5e

const byte font8x8[HICHAR-LOCHAR+1][8] = {
{ 0x18,0x18,0x18,0x18,0x00,0x00,0x18,0x00 }, { 0x66,0x66,0x66,0x00,0x00,0x00,0x00,0x00 }, { 0x66,0x66,0xff,0x66,0xff,0x66,0x66,0x00 }, { 0x18,0x3e,0x60,0x3c,0x06,0x7c,0x18,0x00 }, { 0x62,0x66,0x0c,0x18,0x30,0x66,0x46,0x00 }, { 0x3c,0x66,0x3c,0x38,0x67,0x66,0x3f,0x00 }, { 0x06,0x0c,0x18,0x00,0x00,0x00,0x00,0x00 }, { 0x0c,0x18,0x30,0x30,0x30,0x18,0x0c,0x00 }, { 0x30,0x18,0x0c,0x0c,0x0c,0x18,0x30,0x00 }, { 0x00,0x66,0x3c,0xff,0x3c,0x66,0x00,0x00 }, { 0x00,0x18,0x18,0x7e,0x18,0x18,0x00,0x00 }, { 0x00,0x00,0x00,0x00,0x00,0x18,0x18,0x30 }, { 0x00,0x00,0x00,0x7e,0x00,0x00,0x00,0x00 }, { 0x00,0x00,0x00,0x00,0x00,0x18,0x18,0x00 }, { 0x00,0x03,0x06,0x0c,0x18,0x30,0x60,0x00 }, { 0x3c,0x66,0x6e,0x76,0x66,0x66,0x3c,0x00 }, { 0x18,0x18,0x38,0x18,0x18,0x18,0x7e,0x00 }, { 0x3c,0x66,0x06,0x0c,0x30,0x60,0x7e,0x00 }, { 0x3c,0x66,0x06,0x1c,0x06,0x66,0x3c,0x00 }, { 0x06,0x0e,0x1e,0x66,0x7f,0x06,0x06,0x00 }, { 0x7e,0x60,0x7c,0x06,0x06,0x66,0x3c,0x00 }, { 0x3c,0x66,0x60,0x7c,0x66,0x66,0x3c,0x00 }, { 0x7e,0x66,0x0c,0x18,0x18,0x18,0x18,0x00 }, { 0x3c,0x66,0x66,0x3c,0x66,0x66,0x3c,0x00 }, { 0x3c,0x66,0x66,0x3e,0x06,0x66,0x3c,0x00 }, { 0x00,0x00,0x18,0x00,0x00,0x18,0x00,0x00 }, { 0x00,0x00,0x18,0x00,0x00,0x18,0x18,0x30 }, { 0x0e,0x18,0x30,0x60,0x30,0x18,0x0e,0x00 }, { 0x00,0x00,0x7e,0x00,0x7e,0x00,0x00,0x00 }, { 0x70,0x18,0x0c,0x06,0x0c,0x18,0x70,0x00 }, { 0x3c,0x66,0x06,0x0c,0x18,0x00,0x18,0x00 }, { 0x3c,0x66,0x6e,0x6e,0x60,0x62,0x3c,0x00 }, { 0x18,0x3c,0x66,0x7e,0x66,0x66,0x66,0x00 }, { 0x7c,0x66,0x66,0x7c,0x66,0x66,0x7c,0x00 }, { 0x3c,0x66,0x60,0x60,0x60,0x66,0x3c,0x00 }, { 0x78,0x6c,0x66,0x66,0x66,0x6c,0x78,0x00 }, { 0x7e,0x60,0x60,0x78,0x60,0x60,0x7e,0x00 }, { 0x7e,0x60,0x60,0x78,0x60,0x60,0x60,0x00 }, { 0x3c,0x66,0x60,0x6e,0x66,0x66,0x3c,0x00 }, { 0x66,0x66,0x66,0x7e,0x66,0x66,0x66,0x00 }, { 0x3c,0x18,0x18,0x18,0x18,0x18,0x3c,0x00 }, { 0x1e,0x0c,0x0c,0x0c,0x0c,0x6c,0x38,0x00 }, { 0x66,0x6c,0x78,0x70,0x78,0x6c,0x66,0x00 }, { 0x60,0x60,0x60,0x60,0x60,0x60,0x7e,0x00 }, { 0x63,0x77,0x7f,0x6b,0x63,0x63,0x63,0x00 }, { 0x66,0x76,0x7e,0x7e,0x6e,0x66,0x66,0x00 }, { 0x3c,0x66,0x66,0x66,0x66,0x66,0x3c,0x00 }, { 0x7c,0x66,0x66,0x7c,0x60,0x60,0x60,0x00 }, { 0x3c,0x66,0x66,0x66,0x66,0x3c,0x0e,0x00 }, { 0x7c,0x66,0x66,0x7c,0x78,0x6c,0x66,0x00 }, { 0x3c,0x66,0x60,0x3c,0x06,0x66,0x3c,0x00 }, { 0x7e,0x18,0x18,0x18,0x18,0x18,0x18,0x00 }, { 0x66,0x66,0x66,0x66,0x66,0x66,0x3c,0x00 }, { 0x66,0x66,0x66,0x66,0x66,0x3c,0x18,0x00 }, { 0x63,0x63,0x63,0x6b,0x7f,0x77,0x63,0x00 }, { 0x66,0x66,0x3c,0x18,0x3c,0x66,0x66,0x00 }, { 0x66,0x66,0x66,0x3c,0x18,0x18,0x18,0x00 }, { 0x7e,0x06,0x0c,0x18,0x30,0x60,0x7e,0x00 }, { 0x3c,0x30,0x30,0x30,0x30,0x30,0x3c,0x00 }, { 0x00,0x60,0x30,0x18,0x0c,0x06,0x03,0x00 }, { 0x3c,0x0c,0x0c,0x0c,0x0c,0x0c,0x3c,0x00 }, { 0x00,0x18,0x3c,0x7e,0x18,0x18,0x18,0x18 }
};

const byte sprite1[] = {
8,16,
0x00,0x09,0x99,0x00,0x00,0x99,0x90,0x00,
0x00,0x94,0x94,0x90,0x09,0x49,0x49,0x00,
0x04,0x49,0x49,0x90,0x09,0x94,0x94,0x90,
0x94,0x99,0x94,0x90,0x09,0x49,0x99,0x49,
0x99,0x99,0x49,0x93,0x39,0x94,0x99,0x99,
0x04,0x49,0x99,0x94,0x49,0x99,0x94,0x90,
0x00,0x94,0x94,0x43,0x34,0x49,0x49,0x00,
0x00,0x09,0x43,0x94,0x49,0x34,0x90,0x00,
0x00,0x90,0x00,0x39,0x93,0x00,0x09,0x00,
0x00,0x09,0x83,0x33,0x33,0x33,0x90,0x00,
0x00,0x09,0x32,0x23,0x32,0x23,0x90,0x00,
0x00,0x03,0x03,0x23,0x82,0x30,0x30,0x00,
0x03,0x30,0x00,0x33,0x33,0x00,0x03,0x30,
0x00,0x30,0x03,0x00,0x00,0x30,0x03,0x00,
0x00,0x00,0x00,0x30,0x03,0x00,0x00,0x00,
0x00,0x00,0x00,0x40,0x00,0x00,0x00,0x00,
};

inline word swapw(word j) {
  return ((j << 8) | (j >> 8));
}

// x1: 0-151
// y1: 0-255
inline void blit_solid(byte x1, byte y1, byte w, byte h, byte color) {
  blitter.width = w^4;
  blitter.height = h^4;
  blitter.dstart = x1+y1*256; // swapped
  blitter.solid = color;
  blitter.flags = DSTSCREEN|SOLID;
}

inline void blit_copy(byte x1, byte y1, byte w, byte h, const byte* data) {
  blitter.width = w^4;
  blitter.height = h^4;
  blitter.sstart = swapw((word)data);
  blitter.dstart = x1+y1*256; // swapped
  blitter.solid = 0;
  blitter.flags = DSTSCREEN|FGONLY;
}

inline void draw_sprite(const byte* data, byte x, byte y) {
  blitter.width = data[0]^4;
  blitter.height = data[1]^4;
  blitter.sstart = swapw((word)(data+2));
  blitter.dstart = x+y*256; // swapped
  blitter.solid = 0;
  blitter.flags = DSTSCREEN|FGONLY;
}

void draw_char(char ch, byte x, byte y, byte color) {
  byte data[8][4];
  const byte* src = &font8x8[ch-LOCHAR][0];
  int i,j,pixels;
  if (ch < LOCHAR || ch > HICHAR) return;
  for (i=0; i<8; i++) {
    byte b = *src++;
    for (j=0; j<4; j++) {
      pixels = 0;
      if (b & 0x80) pixels |= color & 0xf0;
      if (b & 0x40) pixels |= color & 0x0f;
      data[i][j] = pixels;
      b <<= 2;
    }
  }
  blit_copy(x, y, 4, 8, (char*)data);
}

void draw_string(const char* str, byte x, byte y, byte color) {
  char ch;
  do {
    ch = *str++;
    draw_char(ch, x, y, color);
    x += 4;
  } while (ch);
}

inline void blit_pixel(word xx, byte y, byte color) {
  blitter.width = 1^4;
  blitter.height = 1^4;
  blitter.dstart = (xx>>1)+y*256; // swapped
  blitter.solid = color;
  blitter.flags = (xx&1) ? SOLID|ODDONLY : SOLID|EVENONLY;
}

void main() {
  int i;
  blit_solid(0, 0, 152, 255, 0x00);
  for (i=0; i<16; i++)
    palette[i] = i*7;
  for (i=0; i<152; i++) {
    vidmem[0][i] = 16;
    vidmem[i][2] = 32;
    blit_pixel(i, i, 0x77);
    blit_pixel(i+1, i, 0x33);
  }
  draw_sprite(sprite1, 35, 20);
  draw_string("HELLO WORLD", 20, 5, 0x88);
  while (1) watchdog0x39 = 0x39;
}
