(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{6115:function(e,r,t){Promise.resolve().then(t.t.bind(t,2778,23)),Promise.resolve().then(t.bind(t,9204)),Promise.resolve().then(t.bind(t,4693))},9204:function(e,r,t){"use strict";t.d(r,{ErrorProvider:function(){return o}});var i=t(7437),n=t(2265);let a=(0,n.createContext)();function o(e){let{children:r}=e,[t,o]=(0,n.useState)(null),s=()=>o(null);return(0,i.jsxs)(a.Provider,{value:{error:t,showError:e=>{o(e),setTimeout(()=>o(null),5e3)},clearError:s},children:[r,t&&(0,i.jsxs)("div",{className:"fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded",children:[(0,i.jsx)("span",{className:"block sm:inline",children:t}),(0,i.jsxs)("button",{onClick:s,className:"absolute top-0 bottom-0 right-0 px-4 py-3",children:[(0,i.jsx)("span",{className:"sr-only",children:"Close"}),(0,i.jsx)("svg",{className:"h-4 w-4",viewBox:"0 0 20 20",fill:"currentColor",children:(0,i.jsx)("path",{d:"M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z"})})]})]})]})}},4693:function(e,r,t){"use strict";t.d(r,{UserProvider:function(){return u},a:function(){return l}});var i=t(7437),n=t(2265),a=t(9271),o=t(8858);let s=(0,n.createContext)();function u(e){let{children:r}=e,[t,u]=(0,n.useState)(null),[l,c]=(0,n.useState)(!0),[d,p]=(0,n.useState)([]),[h,f]=(0,n.useState)({}),[b,m]=(0,n.useState)("");(0,n.useEffect)(()=>{console.log("UserContext mount");let e=(0,a.Aj)(o.I8,async e=>{if(console.log("Auth state changed:",null==e?void 0:e.uid),e)try{let r=(0,o.JU)(o.db,"users",e.uid),t=(await (0,o.QT)(r)).data();"teacher"===t.type?u({email:e.email,uid:e.uid,type:t.type,nickname:t.nickname,description:t.description,availability:t.availability,pricing:t.pricing}):"student"===t.type&&u({email:e.email,uid:e.uid,type:t.type,nickname:t.nickname,balance:t.balance,bookingHistory:t.bookingHistory})}catch(e){console.error("Error fetching user data:",e)}else u(null);c(!1)});return()=>e()},[]);let y=async(e,r)=>{try{let t=await (0,a.e5)(o.I8,e,r),i=(0,o.JU)(o.db,"users",t.user.uid),n=(await (0,o.QT)(i)).data();return u({email:t.user.email,uid:t.user.uid,type:null==n?void 0:n.type}),p((null==n?void 0:n.availability)||[]),{success:!0,userData:n}}catch(e){return console.error("Error signing in:",e),{success:!1,error:e}}},v=async e=>{if(null==t?void 0:t.uid)try{let r=(0,o.JU)(o.db,"users",t.uid);await (0,o.pl)(r,{availability:e},{merge:!0}),p(e)}catch(e){throw console.error("Error updating availability:",e),e}},g=async e=>{if(null==t?void 0:t.uid)try{let r=(0,o.JU)(o.db,"users",t.uid);await (0,o.pl)(r,{pricing:e},{merge:!0}),u(r=>({...r,pricing:e}))}catch(e){throw console.error("Error updating price:",e),e}},w=async e=>{if(null==t?void 0:t.uid)try{let r=(0,o.JU)(o.db,"users",t.uid);await (0,o.pl)(r,{nickname:e},{merge:!0}),u(r=>({...r,nickname:e}))}catch(e){throw console.error("Error updating nickname:",e),e}},x=async e=>{if(null==t?void 0:t.uid)try{let r=(0,o.JU)(o.db,"users",t.uid);await (0,o.pl)(r,{description:e},{merge:!0}),u(r=>({...r,description:e}))}catch(e){throw console.error("Error updating description:",e),e}},E=async e=>{if(null==t?void 0:t.uid)try{u(r=>({...r,balance:e}))}catch(e){throw console.error("Error updating user balance:",e),e}},k=async()=>{let e={};return(await (0,o.PL)((0,o.hJ)(o.db,"users"))).forEach(r=>{let t=r.data();"teacher"===t.type&&(e[t.uid]=t)}),f(e),e};return(0,i.jsx)(s.Provider,{value:{user:t,setUser:u,loading:l,availability:d,updateAvailability:v,signIn:y,teacherList:h,fetchTeachers:k,updatePrice:g,updateNickname:w,updateDescription:x,selectedTeacher:b,setSelectedTeacher:m,updateUserBalance:E},children:r})}function l(){let e=(0,n.useContext)(s);if(void 0===e)throw Error("useUser must be used within a UserProvider");return e}},8858:function(e,r,t){"use strict";t.d(r,{I8:function(){return u},JU:function(){return i.JU},PL:function(){return i.PL},QT:function(){return i.QT},db:function(){return s},hJ:function(){return i.hJ},pl:function(){return i.pl}});var i=t(4353),n=t(2848),a=t(9271);let o=(0,n.ZF)({apiKey:"AIzaSyDdKApKZNEERKmPLfB8SxlGsJRTZV5ALvc",authDomain:"tutor-website-5528f.firebaseapp.com",projectId:"tutor-website-5528f",storageBucket:"tutor-website-5528f.appspot.com",messagingSenderId:"320690040214",appId:"1:320690040214:web:fde29b5326692c27e981b7",measurementId:"G-J0MZ8W9SSG"}),s=(0,i.ad)(o),u=(0,a.v0)(o)},2778:function(){}},function(e){e.O(0,[461,301,83,649,971,117,744],function(){return e(e.s=6115)}),_N_E=e.O()}]);