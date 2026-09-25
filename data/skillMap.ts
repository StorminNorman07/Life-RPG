export type Tier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Master";


export type Path =
  | "Body"
  | "Mind"
  | "Spirit"
  | "Life";


export interface SkillNode {

  id:number;

  name:string;

  description:string;

  path:Path;

  tier:Tier;

  ring:number;

  xp:number;

  requires:number[];

  next:number[];

  completed:boolean;

}



export interface SkillMap {

  nodes:SkillNode[];

}



const rawNodes: Omit<SkillNode, "completed">[] = [


/* =====================
   BODY PATH
===================== */


{
  id:1,
  name:"Fitness Foundation",
  description:"Build your physical base.",
  path:"Body",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[],
  next:[2]
},

{
  id:2,
  name:"Strength Training",
  description:"Develop strength.",
  path:"Body",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[1],
  next:[3]
},

{
  id:3,
  name:"Nutrition",
  description:"Fuel your body.",
  path:"Body",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[2],
  next:[4]
},

{
  id:4,
  name:"Recovery",
  description:"Master rest and recovery.",
  path:"Body",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[3],
  next:[5]
},

{
  id:5,
  name:"Athleticism",
  description:"Become physically capable.",
  path:"Body",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[4],
  next:[6]
},

{
  id:6,
  name:"Physical Discipline",
  description:"Stay consistent.",
  path:"Body",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[5],
  next:[7]
},

{
  id:7,
  name:"Peak Routine",
  description:"Build your lifestyle.",
  path:"Body",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[6],
  next:[8]
},

{
  id:8,
  name:"Elite Fitness",
  description:"Reach advanced fitness.",
  path:"Body",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[7],
  next:[9]
},

{
  id:9,
  name:"Peak Health",
  description:"Optimize your body.",
  path:"Body",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[8],
  next:[10]
},

{
  id:10,
  name:"Body Mastery",
  description:"Complete physical mastery.",
  path:"Body",
  tier:"Master",
  ring:1,
  xp:250,
  requires:[9],
  next:[]
},
 /* =====================
    MIND PATH
 ===================== */


{
  id:11,
  name:"Learning",
  description:"Develop curiosity and knowledge.",
  path:"Mind",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[],
  next:[12]
},

{
  id:12,
  name:"Reading",
  description:"Build understanding through reading.",
  path:"Mind",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[11],
  next:[13]
},

{
  id:13,
  name:"Creative Practice",
  description:"Create and improve skills.",
  path:"Mind",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[12],
  next:[14]
},

{
  id:14,
  name:"Problem Solving",
  description:"Sharpen your thinking.",
  path:"Mind",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[13],
  next:[15]
},

{
  id:15,
  name:"Knowledge Base",
  description:"Build deep understanding.",
  path:"Mind",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[14],
  next:[16]
},

{
  id:16,
  name:"Creative Mastery",
  description:"Develop creative ability.",
  path:"Mind",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[15],
  next:[17]
},

{
  id:17,
  name:"Critical Thinking",
  description:"Think clearly and effectively.",
  path:"Mind",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[16],
  next:[18]
},

{
  id:18,
  name:"Expertise",
  description:"Become highly skilled.",
  path:"Mind",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[17],
  next:[19]
},

{
  id:19,
  name:"Innovation",
  description:"Create original ideas.",
  path:"Mind",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[18],
  next:[20]
},

{
  id:20,
  name:"Mind Mastery",
  description:"Complete mental mastery.",
  path:"Mind",
  tier:"Master",
  ring:1,
  xp:250,
  requires:[19],
  next:[]
},



/* =====================
   SPIRIT PATH
===================== */


{
  id:21,
  name:"Faith Foundation",
  description:"Build spiritual discipline.",
  path:"Spirit",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[],
  next:[22]
},

{
  id:22,
  name:"Prayer",
  description:"Develop your relationship with God.",
  path:"Spirit",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[21],
  next:[23]
},

{
  id:23,
  name:"Integrity",
  description:"Practice honesty and virtue.",
  path:"Spirit",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[22],
  next:[24]
},

{
  id:24,
  name:"Service",
  description:"Help others.",
  path:"Spirit",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[23],
  next:[25]
},

{
  id:25,
  name:"Spiritual Growth",
  description:"Grow deeper in faith.",
  path:"Spirit",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[24],
  next:[26]
},

{
  id:26,
  name:"Strong Character",
  description:"Build moral strength.",
  path:"Spirit",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[25],
  next:[27]
},

{
  id:27,
  name:"Leadership",
  description:"Influence others positively.",
  path:"Spirit",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[26],
  next:[28]
},

{
  id:28,
  name:"Wisdom",
  description:"Apply truth and experience.",
  path:"Spirit",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[27],
  next:[29]
},

{
  id:29,
  name:"Virtue",
  description:"Live with excellence.",
  path:"Spirit",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[28],
  next:[30]
},

{
  id:30,
  name:"Spirit Mastery",
  description:"Complete spiritual mastery.",
  path:"Spirit",
  tier:"Master",
  ring:1,
  xp:250,
  requires:[29],
  next:[]
},



/* =====================
   LIFE PATH
===================== */


{
  id:31,
  name:"Financial Awareness",
  description:"Understand money and resources.",
  path:"Life",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[],
  next:[32]
},

{
  id:32,
  name:"Saving",
  description:"Build financial discipline.",
  path:"Life",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[31],
  next:[33]
},

{
  id:33,
  name:"Communication",
  description:"Improve social ability.",
  path:"Life",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[32],
  next:[34]
},

{
  id:34,
  name:"Relationships",
  description:"Build meaningful connections.",
  path:"Life",
  tier:"Bronze",
  ring:4,
  xp:25,
  requires:[33],
  next:[35]
},

{
  id:35,
  name:"Financial Stability",
  description:"Create a strong financial foundation.",
  path:"Life",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[34],
  next:[36]
},

{
  id:36,
  name:"Social Confidence",
  description:"Become comfortable with others.",
  path:"Life",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[35],
  next:[37]
},

{
  id:37,
  name:"Influence",
  description:"Positively impact people.",
  path:"Life",
  tier:"Silver",
  ring:3,
  xp:50,
  requires:[36],
  next:[38]
},

{
  id:38,
  name:"Wealth Building",
  description:"Master creating value.",
  path:"Life",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[37],
  next:[39]
},

{
  id:39,
  name:"Community",
  description:"Build lasting connections.",
  path:"Life",
  tier:"Gold",
  ring:2,
  xp:100,
  requires:[38],
  next:[40]
},

{
  id:40,
  name:"Life Mastery",
  description:"Complete worldly mastery.",
  path:"Life",
  tier:"Master",
  ring:1,
  xp:250,
  requires:[39],
  next:[]
}


];



export const skillMap:SkillMap = {

  nodes: rawNodes.map(node => ({
    ...node,
    completed:false
  }))

};