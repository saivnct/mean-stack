import { Component, OnInit, OnDestroy } from "@angular/core";
import { PageEvent } from "@angular/material";
import { Subscription } from 'rxjs';
import { AuthService } from "src/app/auth/auth.service";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[] = [];
  private postsSub: Subscription;
  userIsAuthenticated = false;
  userId: string;
  private authListenerSubscription : Subscription

  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1,5,10];


  isLoading = false;

  constructor(public postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], totalPosts: number}) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.totalPosts;
      });

    this.userIsAuthenticated = this.authService.getIsAuthenticated();
    this.userId = this.authService.getUsrId();

    this.authListenerSubscription = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUsrId();
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListenerSubscription.unsubscribe();
  }

  onDelete(id){
    this.isLoading = true;
    this.postsService.deletePost(id)
      .subscribe(responseData => {
        console.log(responseData);

        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      }, error => {
        this.isLoading = false;
      });
  }

  onChangedPage(pageData: PageEvent){
    console.log(pageData);
    this.isLoading = true;

    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;

    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}
