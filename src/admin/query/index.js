import User from './User.js'
import Page from './Page.js'
import Login from './Login.js'
import Post from './Post.js'
import Settings from './Settings.js'
import Content from './Content.js'

const queries = {
  getUserQry: User.getUserQry,
  getLoginAuth0Mtn: Login.getLoginAuth0Mtn,
  loginUserQry: Login.loginUserQry,
  getCreatePageQry: Page.getCreatePageQry,
  createPostMetaMtn: Page.createPostMetaMtn,
  updatePostMetaMtn: Page.updatePostMetaMtn,
  getPageQry: Page.getPageQry,
  getUpdatePageQry: Page.getUpdatePageQry,
  getPageListQry: Page.getPageListQry,
  deletePostQry: Page.deletePostQry,
  //deletePostQry: Post.deletePostQry,
  deletePostPermanentQry: Page.deletePostPermanentQry,
  getCreatePostQry: Post.getCreatePostQry,
  getUpdatePostQry: Post.getUpdatePostQry,
  getPostListQry: Post.getPostListQry,
  getContentsQry: Post.getContentsQry,
  getAllCategoryQry: Post.getAllCategoryQry,
  getCreateCategoryOfPostQry: Post.getCreateCategoryOfPostQry,
  getUpdateCategoryOfPostQry: Post.getUpdateCategoryOfPostQry,
  getUserListQry: User.getUserListQry,
  getUserListByTypeQry: User.getUserListByTypeQry,
  createUserMtn: User.createUserMtn,
  getPostQry: Post.getPostQry,
  checkSlugQry: Page.checkSlugQry,
  saveProfileMtn: User.saveProfileMtn,
  saveUserMetaMtn: User.saveUserMetaMtn,
  checkUsernameQry: User.checkUsernameQry,
  checkEmailQry: User.checkEmailQry,
  createUserMetaMtn: User.createUserMetaMtn,
  createUpdateTagOfPostMtn: User.createUpdateTagOfPostMtn,
  changePasswordMtn: User.changePasswordMtn,
  recoverPostQry: Page.recoverPostQry,
  addRoleToUser: User.addRoleToUser,
  deleteRoleUser: User.deleteRoleUser,
  getRolesQry: User.getRolesQry,
  createUpdateCategoryOfPostMtn: Post.createUpdateCategoryOfPostMtn,
  loadSettingsQry: Settings.loadSettingsQry,
  getPermissionConfigQry: Settings.getPermissionConfigQry,
  createUpdateSettingsMtn: Settings.createUpdateSettingsMtn,
  createUpdatePermissionMtn: Settings.createUpdatePermissionMtn,
  getContentListQry: Content.getContentListQry,
  createContentMtn: Content.createContentMtn,
  getContentQry: Content.getContentQry,
  getContentPostListQry: Content.getContentPostListQry,
  deleteUserQry: User.deleteUserQry,
  updateRoleUser: User.updateRoleUser,
  getAllTagQry: Post.getAllTagQry,
  deleteCategoryPermanentQry: Post.deleteCategoryPermanentQry,
  deleteTagPermanentQry: Post.deleteTagPermanentQry,
  createCategory: Post.createCategory,
  createTag: Post.createTag,
  UpdateTag: Post.UpdateTag,
  checkContentSlugQry: Content.checkContentSlugQry
}

module.exports = queries;