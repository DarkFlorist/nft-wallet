function i(){throw new Error("Cycle detected")}function t(){if(!(n>1)){var i,t=!1;while(void 0!==r){var o=r;r=void 0;h++;while(void 0!==o){var s=o.o;o.o=void 0;o.f&=-3;if(!(8&o.f)&&e(o))try{o.c()}catch(o){if(!t){i=o;t=!0}}o=s}}h=0;n--;if(t)throw i}else n--}var o=void 0,r=void 0,n=0,h=0,s=0;function f(i){if(void 0!==o){var t=i.n;if(void 0===t||t.t!==o){t={i:0,S:i,p:o.s,n:void 0,t:o,e:void 0,x:void 0,r:t};if(void 0!==o.s)o.s.n=t;o.s=t;i.n=t;if(32&o.f)i.S(t);return t}else if(-1===t.i){t.i=0;if(void 0!==t.n){t.n.p=t.p;if(void 0!==t.p)t.p.n=t.n;t.p=o.s;t.n=void 0;o.s.n=t;o.s=t}return t}}}function v(i){this.v=i;this.i=0;this.n=void 0;this.t=void 0}v.prototype.h=function(){return!0};v.prototype.S=function(i){if(this.t!==i&&void 0===i.e){i.x=this.t;if(void 0!==this.t)this.t.e=i;this.t=i}};v.prototype.U=function(i){if(void 0!==this.t){var t=i.e,o=i.x;if(void 0!==t){t.x=o;i.e=void 0}if(void 0!==o){o.e=t;i.x=void 0}if(i===this.t)this.t=o}};v.prototype.subscribe=function(i){var t=this;return p(function(){var o=t.value,r=32&this.f;this.f&=-33;try{i(o)}finally{this.f|=r}})};v.prototype.valueOf=function(){return this.value};v.prototype.toString=function(){return this.value+""};v.prototype.toJSON=function(){return this.value};v.prototype.peek=function(){return this.v};Object.defineProperty(v.prototype,"value",{get:function(){var i=f(this);if(void 0!==i)i.i=this.i;return this.v},set:function(r){if(o instanceof d)!function(){throw new Error("Computed cannot have side-effects")}();if(r!==this.v){if(h>100)i();this.v=r;this.i++;s++;n++;try{for(var f=this.t;void 0!==f;f=f.x)f.t.N()}finally{t()}}}});function e(i){for(var t=i.s;void 0!==t;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function u(i){for(var t=i.s;void 0!==t;t=t.n){var o=t.S.n;if(void 0!==o)t.r=o;t.S.n=t;t.i=-1;if(void 0===t.n){i.s=t;break}}}function c(i){var t=i.s,o=void 0;while(void 0!==t){var r=t.p;if(-1===t.i){t.S.U(t);if(void 0!==r)r.n=t.n;if(void 0!==t.n)t.n.p=r}else o=t;t.S.n=t.r;if(void 0!==t.r)t.r=void 0;t=r}i.s=o}function d(i){v.call(this,void 0);this.x=i;this.s=void 0;this.g=s-1;this.f=4}(d.prototype=new v).h=function(){this.f&=-3;if(1&this.f)return!1;if(32==(36&this.f))return!0;this.f&=-5;if(this.g===s)return!0;this.g=s;this.f|=1;if(this.i>0&&!e(this)){this.f&=-2;return!0}var i=o;try{u(this);o=this;var t=this.x();if(16&this.f||this.v!==t||0===this.i){this.v=t;this.f&=-17;this.i++}}catch(i){this.v=i;this.f|=16;this.i++}o=i;c(this);this.f&=-2;return!0};d.prototype.S=function(i){if(void 0===this.t){this.f|=36;for(var t=this.s;void 0!==t;t=t.n)t.S.S(t)}v.prototype.S.call(this,i)};d.prototype.U=function(i){if(void 0!==this.t){v.prototype.U.call(this,i);if(void 0===this.t){this.f&=-33;for(var t=this.s;void 0!==t;t=t.n)t.S.U(t)}}};d.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var i=this.t;void 0!==i;i=i.x)i.t.N()}};d.prototype.peek=function(){if(!this.h())i();if(16&this.f)throw this.v;return this.v};Object.defineProperty(d.prototype,"value",{get:function(){if(1&this.f)i();var t=f(this);this.h();if(void 0!==t)t.i=this.i;if(16&this.f)throw this.v;return this.v}});function a(i){var r=i.u;i.u=void 0;if("function"==typeof r){n++;var h=o;o=void 0;try{r()}catch(t){i.f&=-2;i.f|=8;l(i);throw t}finally{o=h;t()}}}function l(i){for(var t=i.s;void 0!==t;t=t.n)t.S.U(t);i.x=void 0;i.s=void 0;a(i)}function w(i){if(o!==this)throw new Error("Out-of-order effect");c(this);o=i;this.f&=-2;if(8&this.f)l(this);t()}function y(i){this.x=i;this.u=void 0;this.s=void 0;this.o=void 0;this.f=32}y.prototype.c=function(){var i=this.S();try{if(8&this.f)return;if(void 0===this.x)return;var t=this.x();if("function"==typeof t)this.u=t}finally{i()}};y.prototype.S=function(){if(1&this.f)i();this.f|=1;this.f&=-9;a(this);u(this);n++;var t=o;o=this;return w.bind(this,t)};y.prototype.N=function(){if(!(2&this.f)){this.f|=2;this.o=r;r=this}};y.prototype.d=function(){this.f|=8;if(!(1&this.f))l(this)};function p(i){var t=new y(i);try{t.c()}catch(i){t.d();throw i}return t.d.bind(t)}exports.Signal=v;exports.batch=function(i){if(n>0)return i();n++;try{return i()}finally{t()}};exports.computed=function(i){return new d(i)};exports.effect=p;exports.signal=function(i){return new v(i)};//# sourceMappingURL=signals-core.js.map
