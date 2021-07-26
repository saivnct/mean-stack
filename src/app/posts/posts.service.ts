import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { from, Subject } from "rxjs";
import { map } from "rxjs/operators";

import { Post } from "./post.model";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl + "/posts";

@Injectable({ providedIn: "root" })
export class PostsService {
  private postsUpdated = new Subject<{posts: Post[], totalPosts: number}>();

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  getPost(id: string){
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imageName: string,
      creator: string
    }>(BACKEND_URL+"/"+id)
  }

  getPosts(postsPerPage: number, currentPage: number) {
    console.log("Post service - got posts from:",BACKEND_URL);


    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;

    this.http
      .get<{ message: string; posts: any; totalPosts: number }>(
        BACKEND_URL+queryParams
      )
      .pipe(map(postData => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imageName: post.imageName,
              creator: post.creator
            }
          }),
          totalPosts: postData.totalPosts
        };
      }))
      .subscribe(postTransformData => {
        this.postsUpdated.next(postTransformData);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title",title);
    postData.append("content",content);
    postData.append("image",image, title);

    this.http
      .post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe(responseData => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;

    if (typeof(image) === 'object'){
      postData = new FormData;
      postData.append("title",title);
      postData.append("content",content);
      postData.append("image",image, title);
    }else{
      postData = { id: id, title: title, content: content, imageName: image, creator: this.authService.getUsrId()};
    }



    this.http.put<{ message: string, post: Post }>(BACKEND_URL+"/"+id,postData)
      .subscribe(responseData => {
        console.log(responseData.message);
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string){
    return this.http
      .delete<{ message: string }>(BACKEND_URL+"/"+id);
  }
}
