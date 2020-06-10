import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/api.service'
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { todo } from '../forms'
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  todos;
  todoForm;
  submitted = false;
  key ='';
  selectedTodo;
  imageData;
  constructor(private fb: FormBuilder,
              private router: Router,
              private api :ApiService,
              private domSanitizer:DomSanitizer) { }

  ngOnInit() {
    this.todoForm = todo;
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      thumbnail: ['', ],
      links: ['', ]
    });
    this.getAllTodo();
  }

  getAllTodo(){
    this.api.fetchData('todo', {}, 'GET').subscribe(res => {
      if(res && res.error == false) {
        this.todos = res.data;
      } else {
        this.todos = [];
      } 
    })
  }

 
  onSelectAction(key, item) {
    this.key = key;
    this.imageData = ''
    this.todoForm.reset();
    if(key == 'Edit') {
      this.selectedTodo = item;
      this.todoForm.patchValue({
        title: item.title ,
        description: item.description,
        links: item.links ? item.links : '',
        thumbnail:'',
      })
     
      // this.imageData = item.thumbnail ?  btoa(item.thumbnail['data']) : undefined;
      if(item.thumbnail) {
        this.imageData = item.thumbnail;
      }
    }
    if(key == 'View') {
      this.selectedTodo = item
    }
  }

  delete(item){
    if(window.confirm('Are you sure this action can not be reverted.')){
      this.api.fetchData('todo/'+ item._id, {}, 'DELETE').subscribe(
        res => {
          if(res['error'] == false) {
            alert('Todo deleted succesfully');
            this.getAllTodo();
          } else {
            alert('Something went wrong please try again later');
          }
        }
      )
    }
  }

  addEditTodo(data) {
    console.log(data);
    this.submitted = true;
    if(this.todoForm.invalid) {
      return false;
    }
    let obj = Object.assign({}, data);
    obj['thumbnail'] = this.imageData;
    if(this.key == 'Add') {
      this.api.fetchData('todo', obj, 'POST' ).subscribe(
        res => {
          if(res['error'] == false) {
            document.getElementById('close-popup').click();
            this.submitted = false;
            this.getAllTodo();
            alert('Todo added succesfully.')
          }else {
            alert('Something went wrong please try again later')
          }
        }
        )
      }
      if(this.key == 'Edit') {
        this.api.fetchData('todo/'+this.selectedTodo._id, obj, 'PATCH' ).subscribe(
          res => {
            if(res['error'] == false) {
              document.getElementById('close-popup').click();
            this.submitted = false;
            this.getAllTodo();
            alert('Todo updated succesfully.');
          }else {
            alert('Something went wrong please try again later')
          }
        }
      )
    }
  }

 
  onselectFile(event) {
    if (event.target.files && event.target.files[0]) {
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[i]);

        reader.onload = (e) => {
          // const obj = {
          //   base64_image: e.target['result'],
          // };
          this.imageData = e.target['result'];
         
        };
      }
    }
  }
}
