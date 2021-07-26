const Post = require("../models/post");
const fileHelper = require("../util/file");


exports.createPost = (req, res, next) => {
  console.log('call add post');

  // const url = req.protocol + '://' + req.get("host");
  // const imageUrl =  url + "/images/" + req.file.filename;

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imageName: req.file.filename,
    creator: req.userData.userId
  });
  // console.log(post);

  post.save().then(result => {
    // console.log(result);
    res.status(201).json({
      message: 'Post added successfully',
      post: {
        id: result._id,
        title: result.title,
        content: result.content,
        imageName: result.imageName,
      }
    });
  }).catch(error => {
    res.status(500).json({
      message: 'Creating a post failed!',
    });
  });

}

exports.updatePost = async (req, res, next) => {
  console.log('call update post');
  try{
    const post = await Post.findById(req.params.id);

    if (post){
      if (post.creator.toString() !== req.userData.userId.toString()){
        res.status(401).json({
          message: 'Not Authorized!'
        });
        return
      }

      let imageName = req.body.imageName
      if (req.file){
        console.log("Update IMAGE!!!! old image:",post.imageName);
        fileHelper.deleteImage(post.imageName)

        // const url = req.protocol + "://" + req.get("host");
        // imagePath = url + "/images/" + req.file.filename;

        imageName = req.file.filename
      }else{
        console.log("NO Update IMAGE!!!!",imageName);
      }

      post.title = req.body.title;
      post.content = req.body.content;
      post.imageName = imageName;

      const updateResult = await post.save();

      // const post = new Post({
      //   _id: req.params.id,
      //   title: req.body.title,
      //   content: req.body.content,
      //   imageName: imageName
      // })
      // const updateResult = await Post.updateOne({_id: req.params.id}, post);

      console.log(updateResult);
      res.status(201).json({
        message: 'Post updated successfully',
        post: post
      });
    }

  }catch (error){
    res.status(500).json({
      message: "Couldn't update post!",
    });
  }

}

exports.getPosts = (req, res, next) => {
  console.log('call get posts');

  console.log(req.query);

  const pageSize = +req.query.pagesize ;  //add "+" to convert string to number
  const currentPage = +req.query.page;

  const postQuery = Post.find(); //this will not execution until we call then

  if (pageSize && currentPage){
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }

  let fetchedPosts;
  postQuery.then(documents => {
    // console.log(documents);
    fetchedPosts = documents;
    return Post.count();
  }).then(totalPosts => {
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: fetchedPosts,
      totalPosts: totalPosts
    });
  }).catch(error => {
    res.status(500).json({
      message: 'Fetching posts failed!',
    });
  });

}

exports.getPost = (req, res, next) => {
  console.log('call get post',req.params.id);

  Post.findById(req.params.id).then(post => {
    if (post){
      res.status(200).json(post);
    }else{
      res.status(404).json({message: "Post not found!"})
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Fetching post failed!',
    });
  });
}

exports.deletePost = async (req, res, next) => {
  console.log('call delete post',req.params.id);

  try{
    const post = await Post.findById(req.params.id);

    if (post){
      if (post.creator.toString() !== req.userData.userId.toString()){
        res.status(401).json({
          message: 'Not Authorized!'
        });
        return
      }

      const deleteResult = await Post.findByIdAndDelete(req.params.id);
      console.log(deleteResult);

      fileHelper.deleteImage(post.imageName)
    }

    res.status(200).json({
      message: "Post deleted!"
    });

  }catch (error){
    res.status(500).json({
      message: 'Deleting post failed!',
    });
  }

}
