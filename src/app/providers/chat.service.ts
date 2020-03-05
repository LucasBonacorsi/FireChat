import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth ) {
    this.afAuth.authState.subscribe( user => {
      console.log('Estado del usuario: ', user);

      if(!user){
        return
      }

      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.displayName;
    });
  }

  login(proveedor:string) {
     this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
    this.usuario = {};
  }



  cargarMensaje() {
    this.itemsCollection = this.afs.collection<Mensaje>('chats',
      ref => ref.orderBy('fecha', 'desc').limit(10));

    return this.itemsCollection.valueChanges()
      //.subscribe( msj => this.chats = msj)
      .pipe(map((msj) => {
        console.log(msj);
        this.chats = [];
        for (let m of msj) {
          this.chats.unshift(m);
        }
      }))
  }

  agregarMesaje(texto: string) {
    let mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }
    return this.itemsCollection.add(mensaje)
  }
}
