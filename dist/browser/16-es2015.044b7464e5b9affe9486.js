(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{B9Uk:function(e,t,n){"use strict";n.r(t),n.d(t,"StickerPriceModule",(function(){return R}));var c=n("ofXK"),i=n("3Pt+"),r=n("1kSV"),o=n("ZOsW"),s=n("38Aq"),a=n("tyNb"),l=n("PXna"),d=n("fXoL"),b=function(e){return e.Ak47="AK-47",e.Aug="AUG",e.Awp="AWP",e.CZ75Auto="CZ75-Auto",e.DesertEagle="Desert Eagle",e.DualBerettas="Dual Berettas",e.Famas="FAMAS",e.FiveSeveN="Five-SeveN",e.G3Sg1="G3SG1",e.GalilAR="Galil AR",e.Glock18="Glock-18",e.M249="M249",e.M4A1S="M4A1-S",e.M4A4="M4A4",e.MAC10="MAC-10",e.Mag7="MAG-7",e.Mp5SD="MP5-SD",e.Mp7="MP7",e.Mp9="MP9",e.Negev="Negev",e.Nova="Nova",e.P2000="P2000",e.P250="P250",e.P90="P90",e.PPBizon="PP-Bizon",e.R8Revolver="R8 Revolver",e.SawedOff="Sawed-Off",e.Scar20="SCAR-20",e.Sg553="SG 553",e.Ssg08="SSG 08",e.Tec9="Tec-9",e.Ump45="UMP-45",e.UspS="USP-S",e.Xm1014="XM1014",e}({}),p=n("itXk"),g=n("z6cu"),h=n("nYR2"),k=n("JIr8"),f=n("ggMo"),u=n("JbkY"),m=n("6XjT"),S=n("o0Ci"),K=n("tk/3");let P=(()=>{class e{constructor(e){this.http=e}getCsgoTraderAppPrices(){return this.http.get("/api/sp/prices")}getStickers(){return this.http.get("/api/items/stickers")}}return e.\u0275fac=function(t){return new(t||e)(d.bc(K.b))},e.\u0275prov=d.Jb({token:e,factory:e.\u0275fac,providedIn:"root"}),e})();var v=n("jhN1");const M=["stickerSelectPop"];function C(e,t){if(1&e){const e=d.Ub();d.Tb(0,"ng-select",33),d.fc("ngModelChange",(function(t){return d.Bc(e),d.hc().selectedSkin=t}))("ngModelChange",(function(t){return d.Bc(e),d.hc().selectSkin(t)})),d.Kc(1,"\n                "),d.Sb()}if(2&e){const e=d.hc();d.Eb("w-100",!e.selectedSkin),d.pc("virtualScroll",!0)("items",e.skinsForSelect)("ngModel",e.selectedSkin)("searchFn",e.searchFn)}}function O(e,t){if(1&e){const e=d.Ub();d.Tb(0,"button",42),d.fc("click",(function(){d.Bc(e);const n=t.$implicit;return d.hc(2).selectProvider(n)})),d.Kc(1),d.Sb()}if(2&e){const e=t.$implicit,n=d.hc(2);d.Eb("active",e===n.selectedProviderKey),d.zb(1),d.Lc(e)}}function y(e,t){if(1&e){const e=d.Ub();d.Tb(0,"div",34),d.Kc(1,"\n                "),d.Tb(2,"div",35),d.Kc(3,"\n                  "),d.Tb(4,"div",36,37),d.Kc(6,"\n                    "),d.Tb(7,"a",38),d.fc("click",(function(){return d.Bc(e),d.yc(5).toggle()})),d.Kc(8),d.Ob(9,"i",39),d.Sb(),d.Kc(10,"\n                    "),d.Tb(11,"div",40),d.Kc(12,"\n                      "),d.Ic(13,O,2,3,"button",41),d.Kc(14,"\n                    "),d.Sb(),d.Kc(15,"\n                  "),d.Sb(),d.Kc(16,"\n                "),d.Sb(),d.Kc(17,"\n              "),d.Sb()}if(2&e){const e=d.hc();d.zb(8),d.Mc("",e.selectedProviderKey," "),d.zb(5),d.pc("ngForOf",e.availablePriceProviderKeys)}}function x(e,t){if(1&e&&(d.Rb(0),d.Kc(1,"\n                "),d.Tb(2,"div",6),d.Kc(3,"\n                  "),d.Tb(4,"div",43),d.Kc(5,"\n                    "),d.Tb(6,"div",44),d.Kc(7),d.Tb(8,"a",45),d.Kc(9,"Discord"),d.Sb(),d.Kc(10,"\n                    "),d.Sb(),d.Kc(11,"\n                  "),d.Sb(),d.Kc(12,"\n                "),d.Sb(),d.Kc(13,"\n              "),d.Qb()),2&e){const e=d.hc();d.zb(7),d.Mc("\n                      ",e.error,". Or visit our "),d.zb(1),d.Ab("href",e.systemConst.discordUrl,d.Dc)}}function T(e,t){if(1&e&&(d.Tb(0,"p",66),d.Kc(1),d.Sb()),2&e){const e=d.hc(2);d.pc("ngClass","text-rarity-"+e.selectedSkinInfo.rarity.value),d.zb(1),d.Lc(e.selectedSkinInfo.rarity.name)}}function w(e,t){if(1&e&&(d.Tb(0,"p",67),d.Kc(1),d.Sb()),2&e){const e=d.hc(2);d.zb(1),d.Lc(e.selectedSkinInfo.collection.name)}}function _(e,t){if(1&e&&(d.Rb(0),d.Kc(1),d.ic(2,"currency"),d.Qb()),2&e){const e=d.hc(2).$implicit;d.zb(1),d.Mc("\n                                  ",d.kc(2,1,null==e?null:e.providerPrice,"USD"),"\n                                ")}}function I(e,t){if(1&e){const e=d.Ub();d.Tb(0,"button",42),d.fc("click",(function(){d.Bc(e);const n=t.$implicit;return d.hc(5).selectProvider(n)})),d.Kc(1),d.Sb()}if(2&e){const e=t.$implicit;d.zb(1),d.Lc(e)}}function z(e,t){if(1&e){const e=d.Ub();d.Kc(0,"\n                                  "),d.Tb(1,"div",77),d.Kc(2,"\n                                    No price\n                                  "),d.Sb(),d.Kc(3,"\n                                  "),d.Tb(4,"div",78,79),d.Kc(6,"\n                                    "),d.Tb(7,"div",80),d.fc("click",(function(){d.Bc(e);const t=d.yc(5),n=d.hc(2).$implicit;return d.hc(2).createProvidersForSticker(n,t)})),d.Kc(8,"\n                                      See available\n                                      "),d.Ob(9,"br"),d.Kc(10,"providers\n                                      "),d.Ob(11,"i",39),d.Kc(12,"\n                                    "),d.Sb(),d.Kc(13,"\n                                    "),d.Tb(14,"div",40),d.Kc(15,"\n                                      "),d.Ic(16,I,2,1,"button",81),d.Kc(17,"\n                                    "),d.Sb(),d.Kc(18,"\n                                  "),d.Sb(),d.Kc(19,"\n                                ")}if(2&e){const e=d.hc(4);d.zb(16),d.pc("ngForOf",e.availableProviderKeysForSticker)}}function F(e,t){if(1&e){const e=d.Ub();d.Rb(0),d.Kc(1,"\n                            "),d.Tb(2,"div",70),d.Kc(3,"\n                              "),d.Tb(4,"span",71),d.Kc(5,"\n                                "),d.Ob(6,"i",72),d.Kc(7,"\n                                "),d.Ob(8,"img",73),d.Kc(9,"\n                              "),d.Sb(),d.Kc(10,"\n                              "),d.Tb(11,"div",74),d.Kc(12,"\n                                "),d.Ic(13,_,3,4,"ng-container",17),d.Kc(14,"\n                                "),d.Ic(15,z,20,1,"ng-template",null,75,d.Jc),d.Kc(17,"\n                                "),d.Tb(18,"i",76),d.fc("click",(function(){d.Bc(e);const t=d.hc().$implicit;return d.hc(2).cloneSticker(t)})),d.Sb(),d.Kc(19,"\n                              "),d.Sb(),d.Kc(20,"\n                            "),d.Sb(),d.Kc(21,"\n                          "),d.Qb()}if(2&e){const e=d.yc(16),t=d.hc(),n=t.last,c=t.$implicit,i=d.yc(8);d.zb(2),d.Eb("ml-3",!n),d.zb(2),d.pc("ngbPopover",i)("autoClose","outside")("ngbTooltip",c.market_hash_name),d.zb(4),d.pc("src",c.image,d.Dc),d.Ab("alt",c.market_hash_name),d.zb(5),d.pc("ngIf",null==c?null:c.providerPrice)("ngIfElse",e)}}function A(e,t){if(1&e&&(d.Kc(0,"\n                            "),d.Tb(1,"span",82,83),d.Kc(3,"\n                              "),d.Ob(4,"i",84),d.Kc(5,"\n                            "),d.Sb(),d.Kc(6,"\n                          ")),2&e){d.hc();const e=d.yc(8);d.zb(1),d.pc("ngbPopover",e)("autoClose","outside")}}function D(e,t){if(1&e){const e=d.Ub();d.Kc(0,"\n                            "),d.Tb(1,"div",53),d.Kc(2,"\n                              "),d.Tb(3,"ng-select",85),d.fc("ngModelChange",(function(t){d.Bc(e);const n=d.hc().index;return d.hc(2).selectedStickers[n]=t}))("change",(function(){d.Bc(e);const t=d.hc().index,n=d.hc(2);return n.setStickerInfo(n.selectedStickers[t],t)})),d.Kc(4,"\n                              "),d.Sb(),d.Kc(5,"\n                            "),d.Sb(),d.Kc(6,"\n                          ")}if(2&e){const e=d.hc().index,t=d.hc(2);d.zb(3),d.pc("virtualScroll",!0)("items",t.stickersForSelect)("ngModel",t.selectedStickers[e])("searchFn",t.searchFn)}}function L(e,t){if(1&e&&(d.Rb(0),d.Kc(1,"\n                          "),d.Ic(2,F,22,9,"ng-container",17),d.Kc(3,"\n                          "),d.Ic(4,A,7,2,"ng-template",null,68,d.Jc),d.Kc(6,"\n                          "),d.Ic(7,D,7,4,"ng-template",null,69,d.Jc),d.Kc(9,"\n                        "),d.Qb()),2&e){const e=t.$implicit,n=d.yc(5);d.zb(2),d.pc("ngIf",e)("ngIfElse",n)}}function N(e,t){if(1&e){const e=d.Ub();d.Rb(0),d.Kc(1,"\n                "),d.Tb(2,"div",46),d.Kc(3,"\n                  "),d.Tb(4,"div",47),d.Kc(5,"\n                    "),d.Ob(6,"img",48),d.Kc(7,"\n                    "),d.Ic(8,T,2,2,"p",49),d.Kc(9,"\n                    "),d.Ic(10,w,2,1,"p",50),d.Kc(11,"\n                    "),d.Tb(12,"h5",51),d.Kc(13,"\n                      "),d.Tb(14,"span",52),d.Kc(15),d.Sb(),d.Kc(16,"\n                    "),d.Sb(),d.Kc(17,"\n                    "),d.Tb(18,"div",53),d.Kc(19,"\n                      "),d.Tb(20,"div",54),d.Kc(21,"\n                        "),d.Tb(22,"div",55),d.Kc(23,"\n                          "),d.Tb(24,"span",56),d.Kc(25,"$"),d.Sb(),d.Kc(26,"\n                        "),d.Sb(),d.Kc(27,"\n                        "),d.Tb(28,"input",57,58),d.fc("ngModelChange",(function(t){return d.Bc(e),d.hc().marketPrice=t}))("ngModelChange",(function(){return d.Bc(e),d.hc().calculateSP()})),d.Sb(),d.Kc(30,"\n                      "),d.Sb(),d.Kc(31,"\n                    "),d.Sb(),d.Kc(32,"\n                  "),d.Sb(),d.Kc(33,"\n                  "),d.Tb(34,"div",59),d.Kc(35,"\n                    "),d.Tb(36,"h3",60),d.Kc(37),d.Sb(),d.Kc(38,"\n                    "),d.Tb(39,"div"),d.Kc(40,"\n                      "),d.Tb(41,"h5"),d.Kc(42,"Stickers:"),d.Sb(),d.Kc(43,"\n                      "),d.Tb(44,"div",61),d.Kc(45,"\n                        "),d.Ic(46,L,10,2,"ng-container",62),d.Kc(47,"\n                      "),d.Sb(),d.Kc(48,"\n                    "),d.Sb(),d.Kc(49,"\n                    "),d.Tb(50,"div",63),d.Kc(51,"\n                      "),d.Tb(52,"h5",51),d.Kc(53,"\n                        Skin listed for:\n                      "),d.Sb(),d.Kc(54,"\n                      "),d.Tb(55,"div",53),d.Kc(56,"\n                        "),d.Tb(57,"div",54),d.Kc(58,"\n                          "),d.Tb(59,"div",55),d.Kc(60,"\n                            "),d.Tb(61,"span",56),d.Kc(62,"$"),d.Sb(),d.Kc(63,"\n                          "),d.Sb(),d.Kc(64,"\n                          "),d.Tb(65,"input",64,65),d.fc("ngModelChange",(function(t){return d.Bc(e),d.hc().listedFor=t}))("ngModelChange",(function(){return d.Bc(e),d.hc().calculateSP()})),d.Sb(),d.Kc(67,"\n                        "),d.Sb(),d.Kc(68,"\n                      "),d.Sb(),d.Kc(69,"\n                    "),d.Sb(),d.Kc(70,"\n                  "),d.Sb(),d.Kc(71,"\n                "),d.Sb(),d.Kc(72,"\n              "),d.Qb()}if(2&e){const e=d.yc(29),t=d.yc(66),n=d.hc();d.zb(6),d.pc("src",(null==n.selectedSkinInfo?null:n.selectedSkinInfo.image)||"assets/unknown.png",d.Dc),d.zb(2),d.pc("ngIf",n.selectedSkinInfo),d.zb(2),d.pc("ngIf",n.selectedSkinInfo),d.zb(5),d.Mc("",n.selectedProviderKey," Market price:"),d.zb(13),d.Eb("is-invalid",e.invalid),d.pc("ngModel",n.marketPrice),d.zb(9),d.Lc(n.selectedSkin.key),d.zb(9),d.pc("ngForOf",n.selectedStickers),d.zb(19),d.Eb("is-invalid",t.invalid),d.pc("ngModel",n.listedFor)}}function j(e,t){if(1&e&&(d.Tb(0,"div"),d.Kc(1,"\n                    Sticker price: "),d.Tb(2,"b",86),d.Kc(3),d.ic(4,"percent"),d.Sb(),d.Kc(5,"\n                  "),d.Sb()),2&e){const e=d.hc();d.zb(2),d.pc("ngClass",e.stickerPricePercent>=0?"text-success":"text-danger"),d.zb(1),d.Mc("\n                      ",d.kc(4,2,e.stickerPricePercent,"1.1-2"),"")}}function B(e,t){1&e&&(d.Rb(0),d.Kc(1,"\n    Please select skin\n  "),d.Qb())}function E(e,t){if(1&e&&(d.Kc(0,"\n  "),d.Ic(1,B,2,0,"ng-container",16),d.Kc(2,"\n")),2&e){const e=d.hc();d.zb(1),d.pc("ngIf",!e.error)}}const U=[{path:"",component:(()=>{class e{constructor(e,t,n,c,i,r,o,s,a){this.systemConst=e,this.tradeupSearchService=t,this.stickerPriceService=n,this.cdr=c,this.platformId=i,this.meta=r,this.userPreferencesService=o,this.renderer=s,this.document=a,this.isLoading=!0,this.skinsForSelect=[],this.stickersForSelect=[],this.selectedStickers=new Array(4).fill(null),this.availablePriceProviderKeys=[],this.marketPrice=0,this.availableProviderKeysForSticker=[],this.error="",this.storedStickerInfo=[],this.searchFn=(e,t)=>t.key.toLowerCase().replace(" | "," ").replace(" | "," ").replace("(","").replace(")","").includes(e.toLowerCase()),this.userPreferences=this.userPreferencesService.getPreferences()||new S.a}ngOnInit(){this.meta.updateTag({name:"description",content:"A simple tool to calculate the overpay on stickered CS:GO skins!"}),this.toggleDarkMode(this.userPreferences.darkMode),Object(c.E)(this.platformId)&&Object(p.a)([this.stickerPriceService.getCsgoTraderAppPrices(),this.stickerPriceService.getStickers(),this.tradeupSearchService.getItems()]).pipe(Object(h.a)(()=>{this.isLoading=!1,this.cdr.markForCheck()}),Object(k.a)(e=>(this.error="Something went wrong. Please contact support@tradeup.ninja",Object(g.a)(e)))).subscribe(e=>{const[t,n,c]=e;this.storedStickerInfo=n,this.storedTradeupItems=c,this.storedItems=t;const i=Object.keys(t),r=Object.values(b);i.forEach(e=>{const n=e.toLowerCase();n.includes("sticker |")&&this.stickersForSelect.push({key:e,prices:t[e]}),!n.includes("souvenir")&&!n.includes("graffiti")&&!n.includes("sticker | ")&&r.some(e=>n.includes(`${e.toLowerCase()} `))&&this.skinsForSelect.push({key:e,prices:t[e]})}),this.sortAlphabetically(this.skinsForSelect),this.sortAlphabetically(this.stickersForSelect),this.skinsForSelect=[...this.skinsForSelect],this.stickersForSelect=[...this.stickersForSelect]})}selectSkin(e){if(e){this.selectedStickers.fill(null);const t=e.key.replace(/ \([^)]*\)|\[[^\]]*\]/,"").replace("StatTrak\u2122 ","");this.selectedSkinInfo=this.storedTradeupItems.weapons[t],this.availablePriceProviderKeys=Object.keys(e.prices),this.selectProvider(this.availablePriceProviderKeys[0])}else this.selectedSkinInfo=void 0,this.availablePriceProviderKeys.length=0,this.selectProvider()}selectProvider(e=""){this.selectedProviderKey=e,e&&(this.marketPrice=this.getSkinStartingPrice(e,this.selectedSkin),this.selectedStickers.map(t=>{t&&(t.providerPrice=this.getStickerPrice(e,t))}),this.calculateSP())}setStickerInfo(e,t){if(e){const n=this.storedStickerInfo.find(t=>t.market_hash_name.toLowerCase().includes(e.key.toLowerCase()));this.selectedStickers[t]=n?Object.assign(e,n,{providerPrice:this.getStickerPrice(this.selectedProviderKey,e)}):void 0}else this.selectedStickers[t]=void 0;this.calculateSP(),this.closePopover()}closePopover(){this.stickerSelectPop&&this.stickerSelectPop.close()}calculateSP(){const e=this.selectedStickers.some(e=>Boolean(e)),t=this.selectedStickers.filter(e=>Boolean(e)).every(e=>null==e?void 0:e.providerPrice);if(e&&t&&this.selectedSkin&&this.listedFor&&this.marketPrice){const e=this.selectedStickers.reduce((e,t)=>e+((null==t?void 0:t.providerPrice)||0),0);this.stickerPricePercent=(this.listedFor-this.marketPrice)/e}else this.stickerPricePercent=0}createProvidersForSticker(e,t){t.isOpen()?(this.availableProviderKeysForSticker.length=0,t.close()):(this.availableProviderKeysForSticker=Object.keys(e.prices).filter(t=>Boolean(this.getStickerPrice(t,e))),t.open())}cloneSticker(e){const t=this.selectedStickers.findIndex(e=>!e);-1!==t&&this.setStickerInfo(e,t)}toggleDarkMode(e=!this.userPreferences.darkMode,t){Object(c.E)(this.platformId)&&(this.userPreferences.darkMode=e,t&&this.userPreferencesService.updatePreferences(this.userPreferences),this.userPreferences.darkMode?(this.renderer.addClass(this.document.body,"theme-dark"),this.renderer.removeClass(this.document.body,"theme-light")):(this.renderer.addClass(this.document.body,"theme-light"),this.renderer.removeClass(this.document.body,"theme-dark")))}getStickerPrice(e,t){const n=this.getSkinStartingPrice(e,t);return isNaN(n)?null:n}getSkinStartingPrice(e,t){switch(e){case"steam":return t.prices.steam.last_7d;case"bitskins":return+t.prices.bitskins.price;case"lootfarm":return t.prices.lootfarm;case"csgotm":return+t.prices.csgotm;case"csmoney":return t.prices.csmoney.price;case"skinport":return t.prices.skinport.starting_at;case"csgotrader":return t.prices.cstrade.price;case"csgoempire":return t.prices.csgoempire;case"swapgg":return t.prices.swapgg;case"csgoexo":return t.prices.csgoexo;case"buff163":return t.prices.buff163.starting_at.price;default:return 0}}sortAlphabetically(e){e.sort((e,t)=>e.key<t.key?-1:e.key>t.key?1:0)}}return e.\u0275fac=function(t){return new(t||e)(d.Nb(f.a),d.Nb(u.a),d.Nb(P),d.Nb(d.h),d.Nb(d.B),d.Nb(v.d),d.Nb(m.a),d.Nb(d.D),d.Nb(c.e))},e.\u0275cmp=d.Hb({type:e,selectors:[["app-sticker-price"]],viewQuery:function(e,t){var n;1&e&&d.Qc(M,!0),2&e&&d.xc(n=d.gc())&&(t.stickerSelectPop=n.first)},decls:125,vars:13,consts:[[1,"context"],[1,"container"],[1,"logo","text-center"],["routerLink","/","alt","Link to Tradeup.Ninja",1,"d-inline-block"],["src","assets/logo.svg","alt","Tradeup Ninja logo",1,"mx-auto","d-block"],[1,"mb-4"],[1,"row"],[1,"col-12","mx-auto"],[1,"card","sp-card","dimmer","m-0","p-0"],[1,"loader"],[1,"dimmer-content"],[1,"card-header","flex-wrap"],[1,"form-group","skinSelect","mb-0"],["bindLabel","key","placeholder","Search for a certain skin",3,"w-100","virtualScroll","items","ngModel","searchFn","ngModelChange",4,"ngIf"],["class","card-options",4,"ngIf"],[1,"card-body"],[4,"ngIf"],[4,"ngIf","ngIfElse"],[1,"card-footer"],[1,"col-sm-6","text-sm-left","text-center"],["name","toggleCollapse","type","button",1,"btn","btn-link","btn-sm",3,"click"],[1,"col-sm-6","text-sm-right","text-center","h4","mb-0"],[1,"col-sm-6","mt-3"],[1,"h6","text-sm-left","text-center","desc"],[1,"h5"],["routerLink","/","alt","Link to Tradeup.Ninja",1,"link","font-weight-bold"],[1,"h6","text-sm-right","text-center","desc"],["href","https://steamcommunity.com/id/meistaGG/","target","_blank","rel","noopener noreferrer",1,"link"],["href","https://steamcommunity.com/id/6matko/","target","_blank","rel","noopener noreferrer",1,"link"],["href","https://csgotrader.app/prices/","target","_blank","rel","noopener noreferrer",1,"link"],["selectSkinFirstTmpl",""],[1,"area"],[1,"circles","mb-0"],["bindLabel","key","placeholder","Search for a certain skin",3,"virtualScroll","items","ngModel","searchFn","ngModelChange"],[1,"card-options"],[1,"form-group","mb-0"],["ngbDropdown","",1,"d-inline-block"],["myDrop","ngbDropdown"],["href","javascript:;","id","priceSource","ngbDropdownAnchor","",1,"btn-link","mr-2","text-capitalize",3,"click"],[1,"chevron-icon","fas","fa-chevron-down"],["ngbDropdownMenu","","aria-labelledby","priceSource"],["ngbDropdownItem","","class","text-capitalize",3,"active","click",4,"ngFor","ngForOf"],["ngbDropdownItem","",1,"text-capitalize",3,"click"],[1,"col-12"],[1,"alert","alert-danger"],["target","_blank","rel","noopener noreferrer",1,"link","text-dark"],[1,"row","p-0","m-0"],[1,"col-md-4","text-center","mb-4"],["alt","",1,"mx-auto","weapon",3,"src"],["class","font-weight-bold mb-0",3,"ngClass",4,"ngIf"],["class","text-muted mb-0",4,"ngIf"],[1,"mb-1"],[1,"text-capitalize"],[1,"form-group"],[1,"input-group"],[1,"input-group-prepend"],[1,"input-group-text"],["name","marketPrice","min","0","step","0.01","type","number","placeholder","0.00","required","",1,"form-control",3,"ngModel","ngModelChange"],["marketPriceInput","ngModel"],[1,"col-md-8"],[1,"mb-0"],[1,"d-flex","justify-content-between","flex-wrap"],[4,"ngFor","ngForOf"],[1,"mt-3"],["name","listed-for","min","0","step","0.01","type","number","placeholder","0.00","required","",1,"form-control",3,"ngModel","ngModelChange"],["listedForInput","ngModel"],[1,"font-weight-bold","mb-0",3,"ngClass"],[1,"text-muted","mb-0"],["selectStickerTmpl",""],["selectStickerPopover",""],[1,"d-flex","flex-column"],["popoverClass","sticker-select-popover item-popover",1,"sticker","sticker-selected",3,"ngbPopover","autoClose","ngbTooltip"],[1,"fas","fa-edit","add-icon"],[1,"sticker-img",3,"src"],[1,"text-center","text-muted"],["noPriceTmpl",""],["ngbTooltip","Clone sticker into empty slot",1,"fas","fa-clone","clone-icon",3,"click"],[1,"text-danger","font-weight-bold"],["ngbDropdown","",1,"mt-1"],["availableProviderDropdown","ngbDropdown"],["id","availableProviders","ngbDropdownAnchor","",1,"available-prices-link","text-primary",3,"click"],["ngbDropdownItem","","class","text-capitalize",3,"click",4,"ngFor","ngForOf"],["popoverClass","sticker-select-popover item-popover",1,"avatar","sticker","avatar","avatar-xl",3,"ngbPopover","autoClose"],["stickerSelectPop","ngbPopover"],[1,"fas","fa-plus","add-icon"],["bindLabel","key","placeholder","Search for a certain sticker",1,"skinSelect","w-100",3,"virtualScroll","items","ngModel","searchFn","ngModelChange","change"],["ngbTooltip","(Market price - Listed for price)/(Total sum of stickers)",3,"ngClass"]],template:function(e,t){if(1&e&&(d.Tb(0,"div",0),d.Kc(1,"\n  "),d.Tb(2,"div",1),d.Kc(3,"\n    "),d.Tb(4,"div",2),d.Kc(5,"\n      "),d.Tb(6,"a",3),d.Kc(7,"\n        "),d.Ob(8,"img",4),d.Kc(9,"\n      "),d.Sb(),d.Kc(10,"\n    "),d.Sb(),d.Kc(11,"\n    "),d.Tb(12,"h1",5),d.Kc(13,"Sticker % checker"),d.Sb(),d.Kc(14,"\n    "),d.Tb(15,"div",6),d.Kc(16,"\n      "),d.Tb(17,"div",7),d.Kc(18,"\n        "),d.Tb(19,"div",8),d.Kc(20,"\n          "),d.Ob(21,"div"),d.Kc(22,"\n          "),d.Ob(23,"div",9),d.Kc(24,"\n          "),d.Tb(25,"div",10),d.Kc(26,"\n            "),d.Tb(27,"div",11),d.Kc(28,"\n              "),d.Tb(29,"div",12),d.Kc(30,"\n                "),d.Ic(31,C,2,6,"ng-select",13),d.Kc(32,"\n              "),d.Sb(),d.Kc(33,"\n              "),d.Ic(34,y,18,2,"div",14),d.Kc(35,"\n            "),d.Sb(),d.Kc(36,"\n            "),d.Tb(37,"div",15),d.Kc(38,"\n              "),d.Ic(39,x,14,2,"ng-container",16),d.Kc(40,"\n              "),d.Ic(41,N,73,12,"ng-container",17),d.Kc(42,"\n            "),d.Sb(),d.Kc(43,"\n            "),d.Tb(44,"div",18),d.Kc(45,"\n              "),d.Tb(46,"div",6),d.Kc(47,"\n                "),d.Tb(48,"div",19),d.Kc(49,"\n                  "),d.Tb(50,"button",20),d.fc("click",(function(){return t.toggleDarkMode(!t.userPreferences.darkMode,!0)})),d.Kc(51),d.Sb(),d.Kc(52,"\n                "),d.Sb(),d.Kc(53,"\n                "),d.Tb(54,"div",21),d.Kc(55,"\n                  "),d.Ic(56,j,6,5,"div",17),d.Kc(57,"\n                "),d.Sb(),d.Kc(58,"\n              "),d.Sb(),d.Kc(59,"\n            "),d.Sb(),d.Kc(60,"\n          "),d.Sb(),d.Kc(61,"\n        "),d.Sb(),d.Kc(62,"\n      "),d.Sb(),d.Kc(63,"\n      "),d.Tb(64,"div",22),d.Kc(65,"\n        "),d.Tb(66,"div",23),d.Kc(67,"\n          Looking for profitable Trade-ups or want to manage your Trade-ups with ease and privacy ?\n          "),d.Ob(68,"br"),d.Kc(69,"\n          "),d.Tb(70,"span",24),d.Kc(71,"Try "),d.Tb(72,"a",25),d.Kc(73,"Tradeup.Ninja"),d.Sb(),d.Sb(),d.Kc(74,"\n        "),d.Sb(),d.Kc(75,"\n      "),d.Sb(),d.Kc(76,"\n      "),d.Tb(77,"div",22),d.Kc(78,"\n        "),d.Tb(79,"div",26),d.Kc(80,"\n          Idea by "),d.Tb(81,"a",27),d.Kc(82,"meista"),d.Sb(),d.Kc(83,". Developed by "),d.Tb(84,"a",28),d.Kc(85,"6matko"),d.Sb(),d.Kc(86,"\n          "),d.Ob(87,"br"),d.Kc(88,"\n          Prices by "),d.Tb(89,"a",29),d.Kc(90,"CSGO\n            Trader App"),d.Sb(),d.Kc(91,"\n        "),d.Sb(),d.Kc(92,"\n      "),d.Sb(),d.Kc(93,"\n    "),d.Sb(),d.Kc(94,"\n  "),d.Sb(),d.Kc(95,"\n"),d.Sb(),d.Kc(96,"\n\n"),d.Ic(97,E,3,1,"ng-template",null,30,d.Jc),d.Kc(99,"\n\n"),d.Tb(100,"div",31),d.Kc(101,"\n  "),d.Tb(102,"ul",32),d.Kc(103,"\n    "),d.Ob(104,"li"),d.Kc(105,"\n    "),d.Ob(106,"li"),d.Kc(107,"\n    "),d.Ob(108,"li"),d.Kc(109,"\n    "),d.Ob(110,"li"),d.Kc(111,"\n    "),d.Ob(112,"li"),d.Kc(113,"\n    "),d.Ob(114,"li"),d.Kc(115,"\n    "),d.Ob(116,"li"),d.Kc(117,"\n    "),d.Ob(118,"li"),d.Kc(119,"\n    "),d.Ob(120,"li"),d.Kc(121,"\n    "),d.Ob(122,"li"),d.Kc(123,"\n  "),d.Sb(),d.Kc(124,"\n"),d.Sb()),2&e){const e=d.yc(98);d.zb(19),d.Eb("active",t.isLoading),d.zb(2),d.Cb("card-status bg-rarity-",null==t.selectedSkinInfo?null:t.selectedSkinInfo.rarity.value,""),d.zb(10),d.pc("ngIf",!t.error),d.zb(3),d.pc("ngIf",t.selectedSkin),d.zb(5),d.pc("ngIf",t.error),d.zb(2),d.pc("ngIf",t.selectedSkin)("ngIfElse",e),d.zb(10),d.Mc("\n                    Switch to ",t.userPreferences.darkMode?"light":"dark"," mode\n                  "),d.zb(5),d.pc("ngIf",t.selectedSkin)("ngIfElse",e)}},directives:[a.g,c.o,o.a,i.o,i.r,r.d,r.e,r.g,c.n,r.f,i.t,i.c,i.x,c.m,r.v,r.z],pipes:[c.d,c.v],styles:['@import url("https://fonts.googleapis.com/css?family=Exo:400,700");body[_ngcontent-%COMP%]{font-family:Exo,sans-serif;overflow:auto}  .sticker-select-popover{max-width:300px;width:100%}.context[_ngcontent-%COMP%], .logo[_ngcontent-%COMP%]{z-index:10}.context[_ngcontent-%COMP%]{width:100%;position:absolute;top:2vh}.context[_ngcontent-%COMP%]   .card[_ngcontent-%COMP%]{z-index:10}.context[_ngcontent-%COMP%]   .card.sp-card[_ngcontent-%COMP%]{border-radius:1.5rem}.context[_ngcontent-%COMP%]   .clone-icon[_ngcontent-%COMP%]{transition:.3s ease;cursor:pointer}.context[_ngcontent-%COMP%]   .clone-icon[_ngcontent-%COMP%]:hover{color:#4e54c8}.context[_ngcontent-%COMP%]   .chevron-icon[_ngcontent-%COMP%]{font-size:.5rem}.context[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{text-align:center;color:#fff;font-size:50px}.context[_ngcontent-%COMP%]   .logo[_ngcontent-%COMP%]{opacity:.8}.context[_ngcontent-%COMP%]   .logo[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{height:20vh}.context[_ngcontent-%COMP%]   .weapon[_ngcontent-%COMP%]{width:100%;max-width:140px}.context[_ngcontent-%COMP%]   .skinSelect[_ngcontent-%COMP%]{max-width:100%;flex:0.9}.context[_ngcontent-%COMP%]   .available-prices-link[_ngcontent-%COMP%]{cursor:pointer;line-height:14px;transition:.3s ease}.context[_ngcontent-%COMP%]   .available-prices-link[_ngcontent-%COMP%]:after{content:none}.context[_ngcontent-%COMP%]   .available-prices-link[_ngcontent-%COMP%]:hover{color:#000!important}.context[_ngcontent-%COMP%]   .sticker[_ngcontent-%COMP%]{cursor:pointer}.context[_ngcontent-%COMP%]   .sticker[_ngcontent-%COMP%]   .add-icon[_ngcontent-%COMP%]{opacity:0;vertical-align:text-top;transition:.3s ease}.context[_ngcontent-%COMP%]   .sticker[_ngcontent-%COMP%]:hover{background-color:#4e54c8}.context[_ngcontent-%COMP%]   .sticker[_ngcontent-%COMP%]:hover   .add-icon[_ngcontent-%COMP%]{color:#fff;opacity:1}.context[_ngcontent-%COMP%]   .sticker-selected[_ngcontent-%COMP%]{position:relative}.context[_ngcontent-%COMP%]   .sticker-selected[_ngcontent-%COMP%]   .add-icon[_ngcontent-%COMP%]{position:absolute;top:50%;margin-top:-12px;text-align:center;width:100%;font-size:24px}.context[_ngcontent-%COMP%]   .sticker-selected[_ngcontent-%COMP%]   .sticker-img[_ngcontent-%COMP%]{max-height:64px}.context[_ngcontent-%COMP%]   .sticker-selected[_ngcontent-%COMP%]:hover{background:none}.context[_ngcontent-%COMP%]   .sticker-selected[_ngcontent-%COMP%]:hover   .add-icon[_ngcontent-%COMP%]{color:#000}.context[_ngcontent-%COMP%]   .sticker-selected[_ngcontent-%COMP%]:hover   img[_ngcontent-%COMP%]{opacity:.2}.area[_ngcontent-%COMP%]{background:#4e54c8;background:-webkit-linear-gradient(270deg,#8f94fb,#4e54c8);width:100%;height:100vh;z-index:1}.circles[_ngcontent-%COMP%]{position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{position:absolute;display:block;list-style:none;width:20px;height:20px;background:hsla(0,0%,100%,.2);-webkit-animation:animate 25s linear infinite;animation:animate 25s linear infinite;bottom:-150px}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:first-child{left:25%;width:80px;height:80px;-webkit-animation-delay:0s;animation-delay:0s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(2){left:10%;width:20px;height:20px;-webkit-animation-delay:2s;animation-delay:2s;-webkit-animation-duration:12s;animation-duration:12s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(3){left:70%;width:20px;height:20px;-webkit-animation-delay:4s;animation-delay:4s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(4){left:40%;width:60px;height:60px;-webkit-animation-delay:0s;animation-delay:0s;-webkit-animation-duration:18s;animation-duration:18s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(5){left:65%;width:20px;height:20px;-webkit-animation-delay:0s;animation-delay:0s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(6){left:75%;width:110px;height:110px;-webkit-animation-delay:3s;animation-delay:3s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(7){left:35%;width:150px;height:150px;-webkit-animation-delay:7s;animation-delay:7s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(8){left:50%;width:25px;height:25px;-webkit-animation-delay:15s;animation-delay:15s;-webkit-animation-duration:45s;animation-duration:45s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(9){left:20%;width:15px;height:15px;-webkit-animation-delay:2s;animation-delay:2s;-webkit-animation-duration:35s;animation-duration:35s}.circles[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]:nth-child(10){left:85%;width:150px;height:150px;-webkit-animation-delay:0s;animation-delay:0s;-webkit-animation-duration:11s;animation-duration:11s}@-webkit-keyframes animate{0%{transform:translateY(0) rotate(0deg);opacity:1;border-radius:0}to{transform:translateY(-1000px) rotate(2turn);opacity:0;border-radius:50%}}@keyframes animate{0%{transform:translateY(0) rotate(0deg);opacity:1;border-radius:0}to{transform:translateY(-1000px) rotate(2turn);opacity:0;border-radius:50%}}'],changeDetection:0}),e})(),data:{title:Object(l.c)("Sticker price checker on skin")}}];let G=(()=>{class e{}return e.\u0275mod=d.Lb({type:e}),e.\u0275inj=d.Kb({factory:function(t){return new(t||e)},providers:[],imports:[[a.h.forChild(U)],a.h]}),e})(),R=(()=>{class e{}return e.\u0275mod=d.Lb({type:e}),e.\u0275inj=d.Kb({factory:function(t){return new(t||e)},providers:[P],imports:[[c.c,G,o.b,s.a,r.h,r.w,r.A,i.l]]}),e})()}}]);