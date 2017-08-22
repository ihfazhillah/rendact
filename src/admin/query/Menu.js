import _ from 'lodash';

const createMenu = function(newMenuName){
  return {
      "query": `
    mutation createMenu($input: CreateMenuInput!) {
        createMenu(input: $input) {
          changedMenu{
            id,
            name
        }
      }
    }
    `,
      "variables": {
        "input": {
          "name": newMenuName
        }
      }
    }
  };

const getAllMenu = {
  "query": `query getMenus{
    viewer {
      allMenus {
        edges {
          node {
            id,
            name,
            items
          }
        }
      }
    }
  }`
}

const getMenuQry = function(menuId) {
  return{"query": 
    `{getMenu(id: "`+menuId+`"){items, id, name, position}}`
    }
};

const getAllCategory = {
  "query": `query getCategories{
    viewer {
      allCategories {
        edges {
          node {
            id,
            name
          }
        }
      }
    }
  }`
}

const getAllPage = {
  "query":
    '{viewer {allPosts(where:  {status: {eq: "Published"}, type:{eq: "page"}} ) { edges { node { id,title}}}}}'
}

const getAllPost = {
  "query": 
    '{viewer {allPosts(where:  {status: {eq: "Published"}, type:{eq: "post"}} ) { edges { node { id,title}}}}}'
}

const deleteMenuQry = function(idList) {
  return{
  "query": `
    mutation DeleteMenu($user: DeleteMenuInput!) {
      deleteMenu(input: $user) {
        changedMenu {
          id
        }
      }
    }
  `,
  "variables": {
    "user": {
      "id": idList
    }
  }
  }
};

const updateMenu = function(menuId, name, menuSortableTree, positionValues){
  return {
      "query": `
    mutation UpdateMenu($input: UpdateMenuInput!) {
        updateMenu(input: $input) {
          changedMenu{
            id,
            name,
            items,
            position
        }
      }
    }
    `,
      "variables": {
        "input": {
          "id": menuId,
          "name": name,
          "items": menuSortableTree,
          "position": positionValues
        }
      }
    }
  };

  const updateMainMenu = function(IdMainMenu){
  return {
      "query": `
    mutation UpdateMenu($input: UpdateMenuInput!) {
        updateMenu(input: $input) {
          changedMenu{
            id,
            position
        }
      }
    }
    `,
      "variables": {
        "input": {
          "id": IdMainMenu,
          "position": ""
        }
      }
    }
  };

const getMainMenu = {
  "query": 
    `query getMenus{
      viewer {
        allMenus(where: {position: {eq: "Main Menu"}}) { 
          edges {
            node { 
              id,
              name, 
              items
              }
            }
          }
        }
    }`
}

const loadAllMenuData = {
  "query": `
query{
	viewer {
    mainMenu:allMenus(where: {position :{eq: "Main Menu"}}){
      edges {
        node {
          id
          name
        }
      }
    }
    
    allMenu:allMenus{
      edges {
        node {
          id
          name
          items
        }
      }
    }
    
    allPage:allPosts(where: {type: {eq : "page"}, status: {eq: "Published"}}){
    edges {
      node {
        id
        title
      }
    }
  }
    allPost:allPosts(where: {type: {eq : "post"}, status: {eq: "Published"}}){
    edges {
      node {
        id
        title
      }
    }
  }
    
    allCategory:allCategories {
      edges {
        node {
          id
          name
        }
      }
    }
  }  
}
`
}

const updateMenuWithPos = (oldMainMenuId, newMenuData) => ({
  query: `
mutation ($updateMenuInput:UpdateMenuInput!, $positionInput:UpdateMenuInput!){
  positionUpdate: updateMenu(input: $positionInput){
    changedMenu {
      id
    }
  }
  
  updateMenu: updateMenu(input: $updateMenuInput){
    changedMenu {
      id
      name
      items
      position
    }
  }
}
`,
  variables: {
    positionInput: {
      id: oldMainMenuId,
      position: ''
    },
    updateMenuInput: {...newMenuData}
  }
})

const queries = {
  createMenu: createMenu,
  getAllMenu: getAllMenu,
  deleteMenuQry: deleteMenuQry,
  updateMenu: updateMenu,
  updateMainMenu: updateMainMenu,
  getAllPage: getAllPage,
  getAllPost: getAllPost,
  getAllCategory: getAllCategory,
  getMenuQry: getMenuQry,
  getMainMenu: getMainMenu,
  loadAllMenuData: loadAllMenuData,
  updateMenuWithPos: updateMenuWithPos
}

export default queries;
