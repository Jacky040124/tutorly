(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[966],{8984:function(e,n,t){Promise.resolve().then(t.bind(t,537))},7648:function(e,n,t){"use strict";t.d(n,{default:function(){return s.a}});var r=t(2972),s=t.n(r)},5956:function(e,n,t){"use strict";t.d(n,{I8:function(){return l},JU:function(){return s.JU},QT:function(){return s.QT},db:function(){return u},pl:function(){return s.pl}});var r=t(2848),s=t(4353),i=t(9271);let a=(0,r.ZF)({apiKey:"AIzaSyDdKApKZNEERKmPLfB8SxlGsJRTZV5ALvc",authDomain:"tutor-website-5528f.firebaseapp.com",projectId:"tutor-website-5528f",storageBucket:"tutor-website-5528f.appspot.com",messagingSenderId:"320690040214",appId:"1:320690040214:web:fde29b5326692c27e981b7",measurementId:"G-J0MZ8W9SSG"}),u=(0,s.ad)(a),l=(0,i.v0)(a)},537:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return l}});var r=t(7437),s=t(2265),i=t(9271),a=t(5956),u=t(7648);function l(){let[e,n]=(0,s.useState)(""),[t,l]=(0,s.useState)(""),[c,d]=(0,s.useState)(""),o=async()=>{try{let n=(await (0,i.Xb)(a.I8,e,t)).user;await (0,a.pl)((0,a.JU)(a.db,"users",n.uid),{email:n.email,uid:n.uid,createdAt:new Date().toISOString(),type:"student"}),d("Sign Up Successful, Sign in here")}catch(e){"auth/email-already-in-use"===e.code?d("You already have an Account, Sign in here"):d(e.message),console.error("Error during sign-up:",e.message)}};return(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{children:"Sign Up"}),(0,r.jsx)("form",{children:(0,r.jsxs)("fieldset",{children:[(0,r.jsx)("label",{htmlFor:"email",children:"Email:"}),(0,r.jsx)("input",{type:"email",id:"email",name:"email",onChange:e=>n(e.target.value)}),(0,r.jsx)("label",{htmlFor:"password",children:"Password:"}),(0,r.jsx)("input",{type:"password",id:"password",name:"password",onChange:e=>l(e.target.value)})]})}),(0,r.jsxs)("div",{className:"flex justify-start pt-10 space-x-10",children:[(0,r.jsx)(u.default,{href:"/signupteacher",children:" Sing up as a teacher"}),(0,r.jsx)("button",{className:"inline-block",onClick:o,children:"Sign Up"}),(0,r.jsx)(u.default,{className:"inline-block",href:"/",children:"Return Home"})]}),c&&(0,r.jsxs)("div",{children:[" ",(0,r.jsx)("p",{className:"error-text",children:c})," ",(0,r.jsx)(u.default,{href:"/signin",children:" Sign In "})," "]})]})}}},function(e){e.O(0,[301,83,972,417,971,117,744],function(){return e(e.s=8984)}),_N_E=e.O()}]);