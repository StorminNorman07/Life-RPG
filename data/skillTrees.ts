export type Tier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Master";


export interface SkillNode {

  id:number;

  tier:Tier;

  title:string;

  description:string;

  xp:number;

  completed:boolean;

}



export interface SkillTree {

  id:string;

  name:string;

  attributes:string[];

  nodes:SkillNode[];

}




export const skillTrees:SkillTree[] = [

  {

    id:"physical",

    name:"Physical Health",


   attributes:[
  "Health",
  "Discipline"
],



    nodes:[


      // Bronze

      {

        id:1,

        tier:"Bronze",

        title:"Empty Goal",

        description:"",

        xp:10,

        completed:false,

      },


      {

        id:2,

        tier:"Bronze",

        title:"Empty Goal",

        description:"",

        xp:20,

        completed:false,

      },


      {

        id:3,

        tier:"Bronze",

        title:"Empty Goal",

        description:"",

        xp:30,

        completed:false,

      },


      {

        id:4,

        tier:"Bronze",

        title:"Empty Goal",

        description:"",

        xp:40,

        completed:false,

      },



      // Silver


      {

        id:5,

        tier:"Silver",

        title:"Empty Goal",

        description:"",

        xp:60,

        completed:false,

      },


      {

        id:6,

        tier:"Silver",

        title:"Empty Goal",

        description:"",

        xp:80,

        completed:false,

      },


      {

        id:7,

        tier:"Silver",

        title:"Empty Goal",

        description:"",

        xp:100,

        completed:false,

      },



      // Gold


      {

        id:8,

        tier:"Gold",

        title:"Empty Goal",

        description:"",

        xp:150,

        completed:false,

      },


      {

        id:9,

        tier:"Gold",

        title:"Empty Goal",

        description:"",

        xp:200,

        completed:false,

      },



      // Master


      {

        id:10,

        tier:"Master",

        title:"Empty Goal",

        description:"",

        xp:300,

        completed:false,

      },


    ]

  }

];