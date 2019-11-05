Z80 = {
  // time clock: the Z80 holds two types of clock (m and t)
  _clock: { m: 0, t: 0 },

  // register set
  _r: {
    a: 0, b: 0, c: 0, d: 0, e: 0, h: 0, l: 0, f: 0,   // 8-bit registers
    pc: 0, sp: 0,                                     // 16-bit registers
    m: 0, t: 0,                                       // clock for last inst
  },

  // add E to A, put result in A (ADD A, E)
  ADDr_e: function() {
    Z80._r.a += Z80._r.e;                     // perform addition
    Z80._r.f = 0;                             // clear flags
    if(!(Z80._r.a & 255)) Z80._r.f |= 0x80;   // check for zero
    if(Z80._r.a > 255) Z80._r.f |= 0x10;      // check for carry
    Z80._r.a &= 255;                          // mask to 8 bits
    Z80._r.m = 1; Z80._r.t = 4;               // 1 m-time taken
  },

  // compare B to A, setting flags (CP A, B)
  CPr_b: function() {
    var i = Z80._r.a;                         // temp copy of A
    i -= Z80._r.b;                            // subtract B
    Z80._r.f |= 0x40;                         // set subtraction flag
    if(!(i & 255)) Z80._r.f |= 0x80;          // check for zero
    if(i < 0) Z80._r.f |= 0x10;               // check for underflow
    Z80._r.m = 1; Z80._r.t = 4;               // 1 m-time taken
  },

  // no-op (NOP)
  NOP: function() {
    Z80._r.m = 1; Z80._r.t = 4;               // 1 m-time taken
  },

  // push registers B and C to the stack (PUSH BC)
  PUSHBC: function() {
    Z80._r.sp--;                              // drop through the stack
    MMU.wb(Z80._r.sp, Z80._r.b);              // write B
    Z80._r.sp--;                              // drop through the stack
    MMU.wb(Z80._r.sp, Z80._r.c);              // write C
    Z80._r.m = 3; Z80._r.t = 12;              // 3 m-times taken
  },

  // pop registers H and L off the stack (POP HL)
  POPHL: function() {
    Z80._r.l = MMU.rb(Z80._r.sp);             // read L
    Z80._r.sp++;                              // move back up the stack
    Z80._r.h = MMU.rb(Z80._r.sp);             // read H
    Z80._r.sp++;                              // move back up the stack
    Z80._r.m = 3; Z80._r.t = 12;              // 3 m-times taken
  },

  // read a byte from absolute location int A (LD A, addr)
  LDAmm: function() {
    var addr = MMU.rw(Z80._r.pc);             // get address from instr
    Z80._r.pc += 2;                           // advance PC
    Z80._r.a = MMU.rb(addr);                  // read from address
    Z80._r.m = 4; Z80._r.t = 16;              // 4 m-times taken
  },

  reset: function() {
    Z80._r.a = 0; Z80._r.b = 0; Z80._r.c = 0; Z80._r.d = 0;
    Z80._r.e = 0; Z80._r.h = 0; Z80._r.l = 0; Z80._r.f = 0;
    Z80._r.sp = 0;
    Z80._r.pc = 0;      // start execution at 0

    Z80._clock.m = 0; Z80._clock.t = 0;
  }
};
