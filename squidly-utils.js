// 2D vector class
let DecimalPlaces = 5;
const ZERO_TOLERENCE = 1e-8;
function parseNumber(num) {
  if (typeof num === "number") return num;
  return parseFloat(num);
}
function sqr(v){return v*v}
function abs(v){return Math.abs(v)}
function sqrt(v){return Math.sqrt(v)}
function sin(v){return Math.sin(v)}
function cos(v){return Math.cos(v)}
function ceil(v){return Math.ceil(v)}
function floor(v){return Math.floor(v)}
function isNaN(v){return Number.isNaN(v)}
function isArray(v){return Array.isArray(v)}
function isNonNullObject$1(o){return o != null && typeof o === "object"}
function isNumber(v){return typeof v === "number"}
function isNonNaNNumber(v){return isNumber(v) && !isNaN(v)}
function round(num, dp = 0){
  let pow = isNonNaNNumber(dp) ? Math.pow(10, dp) : 1;
  return Math.round(num*pow)/pow;
}
function isZero(num) {
  return abs(num) < ZERO_TOLERENCE;
}
function atan(rise, run){
  if(isZero(rise) && isZero(run)){
    return 0
  }
  let theta = Math.atan(abs(rise)/abs(run));
  let pi = Math.PI;
  if(rise > 0){
    if(run > 0){
      return theta
    }else if(run < 0){
      return pi - theta
    }else {
      return pi/2
    }
  }else if(rise < 0){
    if(run > 0){
      return theta + 3*pi/2
    }else if(run < 0){
      return theta + pi
    }else {
      return 3*pi/2
    }
  }else {
    if(run >= 0){
      return 0
    }else {
      return pi
    }
  }
}

function parseVector(x, y = x) {
  if (x instanceof Vector) {
    return x;
  } else {
    return new Vector(x, y);
  }
}

class NaNError extends Error {
  constructor(name, p = "'s") {
    super(`${name} of NaN vector${p}`);
  }
}

class Vector {
  constructor(x = 0, y = x){
    if (isArray(x)) {
      let i = isNonNaNNumber(y) ? y : 0;
      y = x[i+1];
      x = x[i];
    } else if (isNonNullObject$1(x)) {
      y = x.y;
      x = x.x;
    }

    this.x = x;
    this.y = y;
  }

  add(x = 0, y = x) {
    let v = parseVector(x, y);
    if (this.isNaN || v.isNaN)
      throw new NaNError("Addition")
    return new Vector(this._x + v.x, this._y + v.y)
  }
  sub(x = 0, y = x) {
    let v = parseVector(x, y);
    if (this.isNaN || v.isNaN)
      throw new NaNError("Subtraction");
    return new Vector(this._x - v.x, this._y - v.y)
  }
  mul(x = 0, y = x) {
    let v = parseVector(x, y);
    if (this.isNaN || v.isNaN)
      throw new NaNError("Multiplication");
    return new Vector(this._x * v.x, this._y * v.y)
  }
  div(x = 0, y = x) {
    let v = parseVector(x, y);
    if (this.isNaN || v.isNaN)
      throw new NaNError("Division");

    if (isZero(v.x) || isZero(v.y))
      throw new Error("Division by zero containing vector.");

    return new Vector(this._x / v.x, this._y / v.y)
  }
  dot(x = 0, y = x){
    let v = parseVector(x, y);
    if (this.isNaN || v.isNaN)
      throw new NaNError("Dot Product");
    return this._x * v.x + this._y * v.y
  }
  angleBetween(x = 0, y = x){
    let v = parseVector(x, y);
    let a = this.norm();
    let b = v.norm();
    let c = this.distance(v);
    if (isZero(a)|| isZero(b) || isZero(c)){
      return 0
    }
    return Math.acos((sqr(c) - sqr(a) - sqr(b))/(-2*a*b))
  }
  distance(x = 0, y = x){
    let v = parseVector(x, y);
    return v.sub(this).norm();
  }
  dist(x = 0, y = x){
    return this.distance(x, y)
  }
  addV(d) {
    d = parseNumber(d);
    if (isNaN(d) || this.isNaN)
      throw new NaNError("Vertical Addition");
    return new Vector(this._x, this._y + d);
  }
  addH(d) {
    d = parseNumber(d);
    if (isNaN(d) || this.isNaN)
      throw new NaNError("Horizontal Addition");
    return new Vector(this._x + d, this._y)
  }

  grad(){
    if (this.isNaN)
      throw new NaNError("Gradient", "")

    if (isZero(this._x)) return Infinity
    return this._y / this._x;
  }
  sqrt() {
    if (this.isNaN)
      throw new NaNError("Square Root", "");
    return new Vector(sqrt(this._x), sqrt(this._y))
  }
  norm(){
    if (this.isNaN)
      throw new NaNError("Normal length", "")
    return sqrt(sqr(this._y) + sqr(this._x))
  }
  arg(){
    if (this.isNaN)
      throw new NaNError("Argument", "")
    return atan(this._y, this._x);
  }
  dir(){
    let norm = this.norm();
    if(isZero(norm)) {
      return new Vector(0,0)
    }
    return this.div(norm)
  }
  rotate(theta){
    theta = parseNumber(theta);
    if (this.isNaN || isNaN(theta))
    throw new NaNError("Rotation", "")
    return new Vector(this._x*cos(theta) - this._y*sin(theta), this._x*sin(theta) + this._y*cos(theta))
  }
  lurpTo(v, d){
    v = parseVector(v);
    d = parseNumber(d);
    if (isNaN(d)) d = 0;
    if (d < 0) d = 0;
    if (d > 1) d = 1;

		return this.mul(1 - d).add(v.mul(d));
	}
  distToLine(p1, p2){
    p2 = parseVector(p2);
    let line = p2.sub(p1).rotate(Math.PI/2);
    let d = line.dot(this.sub(p1))/line.norm();
    return abs(d)
  }
  reflect(direction = 'V'){
    let newVector = null;
    direction = direction.toUpperCase();
    if ( direction.indexOf('V') !== -1 ){
      newVector = this.mul(new Vector(1, -1));
    }

      if( direction.indexOf('H') !== -1 ){
      newVector = this.mul(new Vector(-1, 1));
    }
    return newVector;
  }

  floor(){
    return new Vector(floor(this._x), floor(this._y))
  }
  ceil(){
    return new Vector(ceil(this._x), ceil(this._y))
  }
  abs(){
    return new Vector(abs(this._x), abs(this._y))
  }

  round(n){
    return new Vector(round(this._x, n), round(this._y, n))
  }

  clone() {return new Vector(this._x, this._y)};
  toString(n = DecimalPlaces) {
    return `${round(this._x, n)},${round(this._y, n)}`
  }

  set x(v){
    let n = parseNumber(v);
    this._x = n;
  }
  get x(){return this._x;}
  set y(v){ this._y = parseNumber(v); }
  get y(){return this._y;}
  get isNaN() {return isNaN(this._x) || isNaN(this._y)}
  get isZero(){return (isZero(this._x) && isZero(this._y))}

  static parseVector(x = 0, y = x) {return parseVector;}
  static intersection(a1, b1, a2, b2, onSegment = true) {
    a1 = parseVector(a1);
    b1 = parseVector(b1);
    a2 = parseVector(a2);
    b2 = parseVector(b2);

  	let m1 = b1.sub(a1).grad();
  	let m2 = b2.sub(a2).grad();
  	let c1 = a1.dot(-m1, 1);
  	let c2 = a2.dot(-m2, 1);

    let isec = new Vector(null);
    if (!isZero(m1 - m2)) {
      let x = (c2 - c1) / (m1 - m2);
      let y = m1 * x + c1;
      isec = new Vector(x, y);
    }

		if (!isec.isNaN) {
			let ab = b1.sub(a1);
			let ac = isec.sub(a1);
			let kac = ab.dot(ac);
			let kab = ab.dot(ab);
			if (!(kac > 0 && kab > kac) && onSegment) {
				isec = null;
			}
		} else {
      isec = null;
    }

  	return isec;
  }
}

const SVGTagNames = {
  animate: SVGAnimateElement,
  animateMotion: SVGAnimateMotionElement,
  animateTransform: SVGAnimateTransformElement,
  circle: SVGCircleElement,
  clipPath: SVGClipPathElement,
  "color-profile": true,
  defs: true,
  desc: true,
  discard: true,
  ellipse: true,
  feBlend: true,
  feColorMatrix: true,
  feComponentTransfer: true,
  feComposite: true,
  feConvolveMatrix: true,
  feDiffuseLighting: true,
  feDisplacementMap: true,
  feDistantLight: true,
  feDropShadow: true,
  feFlood: true,
  feFuncA: true,
  feFuncB: true,
  feFuncG: true,
  feFuncR: true,
  feGaussianBlur: true,
  feImage: true,
  feMerge: true,
  feMergeNode: true,
  feMorphology: true,
  feOffset: true,
  fePointLight: true,
  feSpecularLighting: true,
  feSpotLight: true,
  feTile: true,
  feTurbulence: true,
  filter: true,
  foreignObject: true,
  g: true,
  hatch: true,
  hatchpath: true,
  image: true,
  line: true,
  linearGradient: true,
  marker: true,
  mask: true,
  mesh: true,
  meshgradient: true,
  meshpatch: true,
  meshrow: true,
  metadata: true,
  mpath: true,
  path: true,
  pattern: true,
  polygon: true,
  polyline: true,
  radialGradient: true,
  rect: true,
  script: true,
  set: true,
  solidcolor: true,
  stop: true,
  style: true,
  svg: true,
  switch: true,
  symbol: true,
  text: true,
  textPath: true,
  title: true,
  tspan: true,
  unknown: true,
  use: true,
  view: true,
};

const ObjectClass = Object.getPrototypeOf(Object);

function isNonNullObject(obj) {return typeof obj === "object" && obj !== null;}

const make = (name, doc = document) => {
  let element = null;
  if (name in SVGTagNames) {
    element = doc.createElementNS("http://www.w3.org/2000/svg", name);
  } else if (typeof name === "string"){
    element = doc.createElement(name);
  }
  return element;
};

const Points = make("svg");

function isSubClass(subcls, cls) {
  while (cls && subcls !== cls) {
    cls = Object.getPrototypeOf(cls);
  }
  return cls === subcls;
}

function is(obj, cdef, plus = "__+") {
  let res = false;
  if (isNonNullObject(obj)) {
    res = isSubClass(cdef, obj[plus]);
  }
  return res;
}

function printChain(cdef) {
  let i = 5;
  let str = "";
  while (cdef && i > 0) {
    if (str) str += " <- ";
    let name = cdef.name;
    if (cdef === ObjectClass) {
      str += "o";
      break;
    }
    str += name;
    cdef = Object.getPrototypeOf(cdef);
    i--;
  }
  return str;
}

function addPrototype(cdef, obj, plus = "__+") {
  if (obj == null || cdef == null) return;
  let proto = cdef.prototype;

  let protoPropNames = Object.getOwnPropertyNames(proto);
  for (let propName of protoPropNames) {
    var prop = Object.getOwnPropertyDescriptor(proto, propName);

    if (propName == 'constructor'){
      obj[plus] = proto.constructor;
    } else {
      if (propName in obj) {
        try {
          obj[propName] = proto[propName];
        } catch(e) {
          console.warn("error setting " + propName);
        }
      } else {
        Object.defineProperty(obj, propName, prop);
      }
    }
  }
}

function extend(obj, cdef, plus = "__+"){
  if (isNonNullObject(obj)) {
      if (!(plus in obj)) obj[plus] = ObjectClass;

    if (extendable(obj, cdef, plus)) {
      extend(obj, Object.getPrototypeOf(cdef), plus);
      addPrototype(cdef, obj, plus);
      return true;
    }
  }
  return false;
}

function extendable(obj, cdef, plus = "__+") {
  let res = false;
  if (isNonNullObject(obj)) {
    if (!is(obj, cdef, plus)) {
      res = isSubClass(obj[plus], cdef);
    }
  }
  return res;
}

function Root(){

}

class SvgPlus extends Root{
  constructor(el){
    super();
    el = SvgPlus.parseElement(el);
    if (el == null) {
      throw new Error("null element")
    }
    let proto = Object.getPrototypeOf(this);
    let res = extend(el, proto.constructor);
    if (!res) {
      throw "failed to extend element with constructor chain\n" + printChain(el["__+"]) + "\n with \n" + printChain(proto.constructor);
    }
    return el;
  }

  set styles(styles){
    if (typeof styles !== 'object' || styles === null){
      throw `Error setting styles:\nStyles must be set to an object, not ${typeof styles}`
    }
    this._style_set = typeof this._style_set != 'object' ? {} : this._style_set;
    for (let style in styles){
      var value = styles[style];
      if (value === null || value === undefined) {
        this.style.removeProperty(style);
        delete this._style_set[style];
      } else {
        this.style.setProperty(style, value);
        this._style_set[style] = value;
      }
    }
  }

  get styles(){
    return this._style_set;
  }

  set props (props){
    if (typeof props !== 'object' || props === null){
      throw `Error setting props:\nsProps must be set to an object, not ${typeof props}`
    }
    this._prop_set = typeof this._prop_set != 'object' ? {} : this._prop_set;
    for (let prop in props){
      var value = props[prop];
      switch (prop) {
        case "style":
        case "styles":
          this.styles = value;
          break;
        case "events":
          this.events = value;
          break;
        case "innerHTML":
        case "content":
          this.innerHTML = value;
          break;
        default:
          this.setAttribute(prop,value);
          this._prop_set[prop] = value;
          break;
      }
    }
  }

  get props(){
    return this._prop_set;
  }

  set events(events) {
    if (typeof events !== 'object' || events === null){
      throw `Error setting events:\nEvents must be set to an object, not ${typeof styles}`
    }
    for (let key in events) {
      if (!(events[key] instanceof Function)){
        throw `Error setting events:\nThe event ${key} is not a valid event`
      }
    }

    for (let key in events) {
      this.addEventListener(key, events[key]);
    }
  }

  set class(val){
    this.props = {class: val};
  }

  get class(){
    return this.getAttribute('class');
  }

  get bbox(){
    let bbox = this.getBoundingClientRect();
    let pos = new Vector(bbox);
    let size = new Vector(bbox.width, bbox.height);
    return [pos, size];
  }

  get svgBBox(){
    let bbox = this.getBBox();
    let pos = new Vector(bbox);
    let size = new Vector(bbox.width, bbox.height);
    return [pos, size];
  }

  createChild(type, props = {}, ...args){
    let child;
    if (type instanceof Function && type.prototype instanceof SvgPlus){
      child = new type(...args);
    }else {
      child = new SvgPlus(type);
    }
    child.props = props;

    this.appendChild(child);
    return child;
  }

  saveSvg(name = 'default'){
    let output = this.outerHTML;

    output = output.replace(/ ( +)/g, '').replace(/^(\n)/gm, '');
    output = output.replace(/></g, '>\n<');

    output = output.split('\n');
    var depth = 0;
    var newOutput = '';
    for (var i = 0; i < output.length; i++){
      depth += (output[i].search(/<\/(g|svg)>/) == -1)?0:-1;
      for (var j = 0; j < depth; j++){
        newOutput += '\t';
      }
      newOutput += output[i] + '\n';
      depth += (output[i].search(/<(g|svg)(\s|\S)*?>/) == -1)?0:1;
    }

    var blob = new Blob([newOutput], {type: "text/plain"});
    var url = null;

    if (url == null){
      url = window.URL.createObjectURL(blob);

      var a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', name + '.svg');
      document.body.prepend(a);
      a.click();
      a.remove();
    }
  }

  watchMutations(config, callback){
    this._mutationObserver = new MutationObserver((mutation, observer) => {
        if (callback instanceof Function) callback(mutation, observer);
        if (this.onmutation instanceof Function) this.onmutation(mutation, observer);
        let event = new Event("mutation");
        this.dispatchEvent(event);
    });

    this._mutationObserver.observe(this, config);
  }

  stopMutationWatch(){
    if (this._mutationObserver instanceof MutationObserver){
      this._mutationObserver.disconnect();
    }
  }

  getVectorAtLength(l) {
    return new Vector(this.getPointAtLength(l));
  }

  isVectorInFill(...values) {
    return this.isPointInFill(this.makeSVGPoint(...values));
  }

  isVectorInStroke(...values) {
    return this.isPointInStroke(this.makeSVGPoint(...values));
  }

  makeSVGPoint(...values) {
    let v = parseVector(...values);
    let p = Points.createSVGPoint();
    p.x = v.x;
    p.y = v.y;
    return p;
  }

  async waveTransition(update, duration = 500, dir = false){
    if (!(update instanceof Function)) return 0;

    duration = parseInt(duration);
    if (Number.isNaN(duration)) return 0;

    return new Promise((resolve, reject) => {
      let t0;
      let end = false;

      let next = (t) => {
        let dt = t - t0;

        if (dt > duration) {
          end = true;
          dt = duration;
        }

        let theta = Math.PI * ( dt / duration  +  (dir ? 1 : 0) );
        let progress =  ( Math.cos(theta) + 1 ) / 2;

        let stop = update(progress);

        if (!end && !stop){
          window.requestAnimationFrame(next);
        }else {
          resolve(progress);
        }
      };
      window.requestAnimationFrame((t) => {
        t0 = t;
        window.requestAnimationFrame(next);
      });
    })
  }

  static make(name){
    return make(name);
  }

  static parseElement(input = null) {
    let parsed = input;

    if (typeof input === "string") {
      parsed = document.getElementById(input);

      if (parsed == null) {
        parsed = SvgPlus.make(input);
      }
    }

    if (!(parsed instanceof Element)) {
      parsed = null;
    }

    return parsed;
  }

  static parseSVGString(string){
    let parser = new DOMParser();
    let doc = parser.parseFromString(string, "image/svg+xml");
    let errors = doc.getElementsByTagName('parsererror');
    let dsvg = doc.querySelector("svg");
    if (errors && errors.length > 0){
      throw doc;
    }
    let svg = make("svg");
    svg.setAttribute("viewBox", dsvg.getAttribute("viewBox"));
    svg.innerHTML = dsvg.innerHTML;
    return svg;
  }

  static is(el, cdef) {
    return is(el, cdef);
  }

  static extendable(el, cdef) {
    return extendable(el, cdef);
  }

  static isSubClass(subcls, cls) {
    return isSubClass(subcls, cls);
  }

  static defineHTMLElement(classDef, className = null) {
    if (!className) {
      className = classDef.name.replace(/(\w)([A-Z][^A-Z])/g, "$1-$2").toLowerCase();
    }
    
    let setters = classDef.observedAttributes;

    let htmlClass = class extends HTMLElement{
      constructor(){
        super();
        if (!SvgPlus.is(this, classDef)) {
          new classDef(this);
        }
      }

      applyAttributes(){
        for (let setter of setters) {
          let value = this.getAttribute(setter);
          if (value != null) {
            this[setter] = value;
          }
        }
      }

      connectedCallback(){
        if (this.isConnected) {
          if (this.onconnect instanceof Function) {
            this.onconnect();
          }
        }
      }

      disconnectedCallback(){
        if (this.ondisconnect instanceof Function) {
          this.ondisconnect();
        }
      }

      adoptedCallback(){
        if (this.onadopt instanceof Function) {
          this.onadopt();
        }
      }

      attributeChangedCallback(name, oldv, newv){
        this[name] = newv;
      }

      static get observedAttributes() { return setters; }
    };

    console.log(className+ " custom element defined");
    customElements.define(className, htmlClass);
  }

  static get SVGTagNames() {
    return SVGTagNames;
  }
}

let Text2SpeechManager = {
    loadUtterances: async (texts) => {},
    speak: async (text) => {}
};

async function speak(text, broadcast) {
    return await Text2SpeechManager.speak(text, broadcast);
}

async function loadUtterances(texts) {
    return Text2SpeechManager.loadUtterances(texts);
}

function isAccessEvent(event) {
    return event != null 
            && typeof event === "object" 
            && Array.isArray(event.eventPromises) 
            && "initialEvent" in event
}

class AccessEvent extends Event {
    clickMode = null;
    initialEvent = null
    eventPromises = [];

    constructor(eventName, mode, config) {
        const Config = {cancelable: true};
        if (typeof config === "object" && config !== null) {
            for (let key in config) {
                Config[key] = config[key];
            }
        }
        super(eventName, Config);
        let oldEvent = this;
        if (isAccessEvent(mode)) {
            if (mode.initialEvent != null && Array.isArray(mode.initialEvent.eventPromises)) {
                mode = mode.initialEvent;
            }
            oldEvent = mode;
            mode = mode.clickMode;
        }
        this.clickMode = mode;
        this.initialEvent = oldEvent;
    }

    async waitFor(promise, stopImmediatePropagation = false) {
        if (stopImmediatePropagation) {
            this.stopImmediatePropagation();
        }
        
        let e = this.initialEvent;

        e.eventPromises.push(promise);

        return await promise;
    }

    async _waitForAll() {
        let i = 0;
        while (i < this.initialEvent.eventPromises.length) {
            let promise = this.initialEvent.eventPromises[i];
            await promise;
            i++;
        }
    }

    async waitAll(timeout){
        let res = null;
        if (typeof timeout === "number") {
            res = await Promise.race([
                this._waitForAll(),
                new Promise(r => setTimeout(r, timeout))
            ]);
        } else {
            res = await this._waitForAll();
        }
        return res;
    }
}

class AccessClickEvent extends AccessEvent {
    constructor(mode) {
        super("access-click", mode);
    }
}

class AccessButtonsLookupTable {
    lookup = {}

    add(element, group) {
        let {lookup} = this;
        if (typeof group === "undefined") group = element.group;
        if (!(group in lookup)) lookup[group] = [];
        if (lookup[group].indexOf(element) == -1) lookup[group].push(element);
    }

    remove(element, group){
        let {lookup} = this;
        if (typeof group === "undefined") group = element.group;
        if (group in lookup) {
            lookup[group] = lookup[group].filter(el => el !== this);
        }
    }

    getVisibleGroups(){
        let newGroups = {};
        let {lookup} = this;
        for (let name in lookup) {
            let group = lookup[name].filter(button => button.isConnected && button.isVisible);
            if (group.length > 0) {
                group.sort((a, b) => {
                    if (a.order != null && b.order == null) return -1;
                    if (a.order == null && b.order != null) return 1;
                    if (a.order == null && b.order == null) return 0;
                    if (a.order != null && b.order != null) {
                        return a.order - b.order;
                    }
                });
                newGroups[name] = [...group];
            }
        }

        let newGroupsSorted = {};
        Object.keys(newGroups).sort((a, b) => {
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }).forEach(key => {
            newGroupsSorted[key] = newGroups[key];
        });
            
        return newGroupsSorted;
    }

    getVisibleButtonsInGroup(group) {
        let {lookup} = this;
        if (group in lookup) {
            let buttons = lookup[group].filter(button => button.isConnected && button.isVisible);
             buttons.sort((a, b) => {
                    if (a.order != null && b.order == null) return -1;
                    if (a.order == null && b.order != null) return 1;
                    if (a.order == null && b.order == null) return 0;
                    if (a.order != null && b.order != null) {
                        return a.order - b.order;
                    }
            });
            return buttons;
        } else {
            return [];
        }
    }

}

function checkClickable(root, element, center){
    let clickable = false;
    try {
        let els = root.elementsFromPoint(center.x, center.y);
        while (els[0].hasAttribute("access-transparent")) els.shift();
        let el = els[0];
        do {
            if (el === element) {
                clickable = true;
                break;
            }
        } while (el = (el.parentNode || el.host));
    } catch (e) {
        clickable = false;
    }
    return clickable
}

const $ = new WeakMap();
const ButtonsLookup = new AccessButtonsLookupTable();
class AccessButtonRoot extends HTMLElement {
    constructor(){
        super();
        $.set(this, {group: "default", order: null, highlighted: false, clickBoxElement: null});
        this.addEventListener("click", (e) => {
            this.accessClick("click", e);
        });
    }

    static get observedAttributes() {return  ["access-group", "access-order"]};

    get group(){ return $.get(this).group; }
    set group(group){ this.setAttribute("access-group", group); }

    get order(){ return $.get(this).order; }
    set order(order){ this.setAttribute("access-order", order); }

    get isVisible() {return this.getIsVisible()}
    get center(){ return this.getCenter(); }

    get hostedRoot() {
        let root = this.clickBoxElement;
        while (!(root instanceof ShadowRoot) && !(root instanceof Document)) {
            let nroot = root.parentNode;
            if (nroot == null) {
                return root;
            } else {
                root = nroot;
            }
        }
        return root;
    }

    set highlight(isHighlighted) {
        $.get(this).highlighted = isHighlighted;
        this.setHighlight(isHighlighted);
    }

    get highlight(){
        return $.get(this).highlighted;
    }

    set clickBoxElement(element) {
        if (element instanceof Element) {
            Object.defineProperty(element, "linkedAccessButton", {get: () => this});
            $.get(this).clickBoxElement = element;
        }
    }

    get clickBoxElement(){
        return ($.get(this).clickBoxElement || this);
    }

    set utteranceText(text) {
        $.get(this).utteranceText = text;
        loadUtterances([text]);
    }

    get utteranceText() {
        return $.get(this).utteranceText;
    }

    async speakUtterance() {
        if (this._speaking) return;
        this._speaking = true;
        await speak(this.utteranceText);
        this._speaking = false;
    }

    async accessClick(mode, timeout) {
        const event = new AccessClickEvent(mode);
        this.dispatchEvent(event);
        this.activeAnimation();
        await event.waitAll(timeout);
    }

    getIsVisible(){return this.isPointInElement(this.center);}

    getCenter(){ 
        let brect = this.getBoundingClientRect();
        let center = new Vector(brect.x + brect.width/2, brect.y + brect.height/2);
        return center;
    }

    setHighlight(isHighlighted){
        this.toggleAttribute("hover", isHighlighted);
    }

    isPointInElement(p) {
        let root = this.hostedRoot;
        let proxy = this.clickBoxElement;
        return checkClickable(root, proxy, p)
    }

    activeAnimation(){
        this.toggleAttribute("active", true);
        setTimeout(() => {
            this.toggleAttribute("active", false);
        }, 200);
    }

    connectedCallback() {
        ButtonsLookup.add(this);
    }
    
    disconnectedCallback() {
        ButtonsLookup.remove(this);
        if (this.ondisconnect instanceof Function) this.ondisconnect();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "access-group") {
            $.get(this).group = newValue;

            if (this.isConnected) {
                ButtonsLookup.remove(this, oldValue);
                ButtonsLookup.add(this, newValue);
            }
        } else if (name === "access-order") {
            let order = parseFloat(newValue);
            if (Number.isNaN(order)) order = null;
            $.get(this).order = order;
        }
    }
}

class AccessButton extends SvgPlus {
    constructor(group) {
        super("access-button");
        this.group = group;
    }

    set utterance(text) {
        this.utteranceText = text;
    }

    get utterance() {
        return this.utteranceText;
    }

    async speak() {
        await this.speakUtterance();
    }

}

function getButtonGroups(){
   return ButtonsLookup.getVisibleGroups();
}

if (!customElements.get("access-button")) {
    customElements.define("access-button", AccessButtonRoot);
}

window.getButtonGroups = getButtonGroups;

export { AccessButton, AccessButtonRoot, AccessClickEvent, AccessEvent, SvgPlus, Vector, getButtonGroups };