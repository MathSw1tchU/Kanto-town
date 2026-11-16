// Layout de Pallet Town: duas casas na parte norte e laboratório na parte sul.
// Coordenadas são ajustáveis; a escala visual segue a organização de FireRed.
export const MAP = {
  tilesX:24, tilesZ:20, tile:2,
  buildings:[
    {id:'player',name:'Casa do protagonista',x:-6,z:-7,w:5.4,d:4.8,color:0xf0dfbd,roof:0xb84b43,shutter:0x9b7651,door:{x:-6,z:-4.5},kind:'house'},
    {id:'rival',name:'Casa do rival',x:6,z:-7,w:5.4,d:4.8,color:0xe8d8b8,roof:0x477eb4,shutter:0x92734f,door:{x:6,z:-4.5},kind:'house'},
    {id:'lab',name:'Laboratório do Professor Carvalho',x:0,z:6,w:7.8,d:6.2,color:0xe5e2d4,roof:0x687b91,shutter:0x7d8b8e,door:{x:0,z:2.9},kind:'lab'}
  ],
  exits:{north:{x:0,z:-19,label:'Rota 1'},south:{x:0,z:19,label:'Rota 21'}}
};
