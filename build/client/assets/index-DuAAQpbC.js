import{E as d,G as f,H as y,t as g,b as p,o as l,F as v,f as b,r as k,q as w,n as T,I as c,J as I,K as x}from"./main-DbwiCszp.js";import{s as S}from"./index-DeLv1j-i.js";import{s as P}from"./index-BxwU-vK-.js";var N=d`
    .p-inputotp {
        display: flex;
        align-items: center;
        gap: dt('inputotp.gap');
    }

    .p-inputotp-input {
        text-align: center;
        width: dt('inputotp.input.width');
    }

    .p-inputotp-input.p-inputtext-sm {
        text-align: center;
        width: dt('inputotp.input.sm.width');
    }

    .p-inputotp-input.p-inputtext-lg {
        text-align: center;
        width: dt('inputotp.input.lg.width');
    }
`,B={root:"p-inputotp p-component",pcInputText:"p-inputotp-input"},D=f.extend({name:"inputotp",style:N,classes:B}),E={name:"BaseInputOtp",extends:P,props:{readonly:{type:Boolean,default:!1},tabindex:{type:Number,default:null},length:{type:Number,default:4},mask:{type:Boolean,default:!1},integerOnly:{type:Boolean,default:!1}},style:D,provide:function(){return{$pcInputOtp:this,$parentInstance:this}}},$={name:"InputOtp",extends:E,inheritAttrs:!1,emits:["change","focus","blur"],data:function(){return{tokens:[]}},watch:{modelValue:{immediate:!0,handler:function(t){this.tokens=t?t.split(""):new Array(this.length)}}},methods:{getTemplateAttrs:function(t){return{value:this.tokens[t]}},getTemplateEvents:function(t){var n=this;return{input:function(o){return n.onInput(o,t)},keydown:function(o){return n.onKeyDown(o)},focus:function(o){return n.onFocus(o)},blur:function(o){return n.onBlur(o)},paste:function(o){return n.onPaste(o)}}},onInput:function(t,n){this.tokens[n]=t.target.value,this.updateModel(t),t.inputType==="deleteContentBackward"?this.moveToPrev(t):(t.inputType==="insertText"||t.inputType==="deleteContentForward"||y()&&t instanceof CustomEvent)&&this.moveToNext(t)},updateModel:function(t){var n=this.tokens.join("");this.writeValue(n,t),this.$emit("change",{originalEvent:t,value:n})},moveToPrev:function(t){var n=this.findPrevInput(t.target);n&&(n.focus(),n.select())},moveToNext:function(t){var n=this.findNextInput(t.target);n&&(n.focus(),n.select())},findNextInput:function(t){var n=t.nextElementSibling;if(n)return n.nodeName==="INPUT"?n:this.findNextInput(n)},findPrevInput:function(t){var n=t.previousElementSibling;if(n)return n.nodeName==="INPUT"?n:this.findPrevInput(n)},onFocus:function(t){t.target.select(),this.$emit("focus",t)},onBlur:function(t){this.$emit("blur",t)},onClick:function(t){setTimeout(function(){return t.target.select()},1)},onKeyDown:function(t){if(!(t.ctrlKey||t.metaKey))switch(t.code){case"ArrowLeft":this.moveToPrev(t),t.preventDefault();break;case"ArrowUp":case"ArrowDown":t.preventDefault();break;case"Backspace":t.target.value.length===0&&(this.moveToPrev(t),t.preventDefault());break;case"ArrowRight":this.moveToNext(t),t.preventDefault();break;case"Enter":case"NumpadEnter":case"Tab":break;default:(this.integerOnly&&!(t.code!=="Space"&&Number(t.key)>=0&&Number(t.key)<=9)||this.tokens.join("").length>=this.length&&t.code!=="Delete")&&t.preventDefault();break}},onPaste:function(t){var n=t.clipboardData.getData("text");if(n.length){var i=n.substring(0,this.length);(!this.integerOnly||!isNaN(i))&&(this.tokens=i.split(""),this.updateModel(t))}t.preventDefault()}},computed:{inputMode:function(){return this.integerOnly?"numeric":"text"},inputType:function(){return this.mask?"password":"text"}},components:{OtpInputText:S}};function O(e,t,n,i,o,r){var m=g("OtpInputText");return l(),p("div",c({class:e.cx("root")},e.ptmi("root")),[(l(!0),p(v,null,b(e.length,function(s){return k(e.$slots,"default",{key:s,events:r.getTemplateEvents(s-1),attrs:r.getTemplateAttrs(s-1),index:s},function(){return[w(m,{value:o.tokens[s-1],type:r.inputType,class:T(e.cx("pcInputText")),name:e.$formName,inputmode:r.inputMode,variant:e.variant,readonly:e.readonly,disabled:e.disabled,size:e.size,invalid:e.invalid,tabindex:e.tabindex,unstyled:e.unstyled,onInput:function(h){return r.onInput(h,s-1)},onFocus:t[0]||(t[0]=function(a){return r.onFocus(a)}),onBlur:t[1]||(t[1]=function(a){return r.onBlur(a)}),onPaste:t[2]||(t[2]=function(a){return r.onPaste(a)}),onKeydown:t[3]||(t[3]=function(a){return r.onKeyDown(a)}),onClick:t[4]||(t[4]=function(a){return r.onClick(a)}),pt:e.ptm("pcInputText")},null,8,["value","type","class","name","inputmode","variant","readonly","disabled","size","invalid","tabindex","unstyled","onInput","pt"])]})}),128))],16)}$.render=O;var A=d`
    .p-skeleton {
        overflow: hidden;
        background: dt('skeleton.background');
        border-radius: dt('skeleton.border.radius');
    }

    .p-skeleton::after {
        content: '';
        animation: p-skeleton-animation 1.2s infinite;
        height: 100%;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transform: translateX(-100%);
        z-index: 1;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));
    }

    [dir='rtl'] .p-skeleton::after {
        animation-name: p-skeleton-animation-rtl;
    }

    .p-skeleton-circle {
        border-radius: 50%;
    }

    .p-skeleton-animation-none::after {
        animation: none;
    }

    @keyframes p-skeleton-animation {
        from {
            transform: translateX(-100%);
        }
        to {
            transform: translateX(100%);
        }
    }

    @keyframes p-skeleton-animation-rtl {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }
`,z={root:{position:"relative"}},K={root:function(t){var n=t.props;return["p-skeleton p-component",{"p-skeleton-circle":n.shape==="circle","p-skeleton-animation-none":n.animation==="none"}]}},C=f.extend({name:"skeleton",style:A,classes:K,inlineStyles:z}),F={name:"BaseSkeleton",extends:I,props:{shape:{type:String,default:"rectangle"},size:{type:String,default:null},width:{type:String,default:"100%"},height:{type:String,default:"1rem"},borderRadius:{type:String,default:null},animation:{type:String,default:"wave"}},style:C,provide:function(){return{$pcSkeleton:this,$parentInstance:this}}};function u(e){"@babel/helpers - typeof";return u=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},u(e)}function M(e,t,n){return(t=R(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function R(e){var t=j(e,"string");return u(t)=="symbol"?t:t+""}function j(e,t){if(u(e)!="object"||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var i=n.call(e,t);if(u(i)!="object")return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var X={name:"Skeleton",extends:F,inheritAttrs:!1,computed:{containerStyle:function(){return this.size?{width:this.size,height:this.size,borderRadius:this.borderRadius}:{width:this.width,height:this.height,borderRadius:this.borderRadius}},dataP:function(){return x(M({},this.shape,this.shape))}}},U=["data-p"];function V(e,t,n,i,o,r){return l(),p("div",c({class:e.cx("root"),style:[e.sx("root"),r.containerStyle],"aria-hidden":"true"},e.ptmi("root"),{"data-p":r.dataP}),null,16,U)}X.render=V;export{$ as a,X as s};
