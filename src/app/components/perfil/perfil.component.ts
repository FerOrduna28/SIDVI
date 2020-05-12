import { Component, OnInit } from '@angular/core';
import {Usuario} from '../../../models/index';
import { SIDVIServices } from 'src/api';
import Swal from 'sweetalert2';
import { _APIResponse } from 'src/api/APIResponse';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  usuario: Usuario;
  idUsuario: number;
  fieldValidations = {
    'nombreCompleto' : true,
    'usuario': true,
    'correo': true,
    'celular': true
  };


  constructor(private router: Router, private sidvi: SIDVIServices) {
    this.usuario = new Usuario(); // se inicializa para que no marque error antes de que asigne el usuario.
   }

  ngOnInit() {
    this.idUsuario = this.sidvi.manager.usuario.idUsuario;
    this.obtenerUsuario(this.idUsuario);
    this.resetValidators();
  }

  obtenerUsuario( id: number ) {
    this.sidvi.usuario.obtenerUsuario(id)
    .subscribe(
      res => {
        this.usuario = new Usuario(res);
        this.usuario.localFileName = 'Seleccione una nueva imagen';
        }, err => { console.log(err); }
      );
  }

  resetValidators() {
    for (let key in this.fieldValidations) {
      if (this.fieldValidations[key]) {
        this.fieldValidations[key] = true; // Use `key` and `value`
      }
    }
  }

  handleFileInput(files: FileList) {
    if (files[0] != null) {
        this.usuario.localFile = files;
        this.usuario.localFileName = files[0].name;
    }
}

validateField(key, input) {
  if (input === '') {
    this.fieldValidations[key] = false;
  } else {
    this.fieldValidations[key] = true;
  }
}

validateAll() {
  // this.fieldValidations.nombreCompleto = (this.usuario.nombreCompleto === '') ? false : true;
  let valid = true;
  if (this.fieldValidations.nombreCompleto === false) {
    valid = false;
  } else if ( this.fieldValidations.usuario === false) {
    valid = false;
  } else if ( this.fieldValidations.correo === false) {
    valid = false;
  } else if (this.fieldValidations.celular === false) {
    valid = false;
  } else if (valid) {
    this.guardar();
  }

}


guardar() {
  delete this.usuario.archivoFoto;
  delete this.usuario.mimetypeFoto;

  this.sidvi.usuario.actualizarUsuario(this.idUsuario, this.usuario).subscribe(
      res => {

          if (this.usuario.localFile != null) {
              this.actualizarImagenPerfil();
              this.usuario.localFile = null;
              this.usuario.localFileName = 'Seleccione una nueva imagen';
              return;
          }

          Swal.fire({ title: '¡Listo!', text: 'Perfil correctamente', icon: 'success', heightAuto: false }).then((result) => {
              if (result.value) {
                  this.obtenerUsuario(this.idUsuario);
              }
          });
      },
      error => {
          console.error(error);
      }
  );
}

actualizarImagenPerfil() {
  this.sidvi.usuario.cargarUsuarioFoto(this.idUsuario, this.usuario.localFile[0]).subscribe(
      res => {
          Swal.fire({ title: '¡Listo!', text: 'Virus actualizado correctamente', icon: 'success', heightAuto: false }).then((result) => {
              if (result.value) {
                  this.obtenerUsuario(this.idUsuario);
              }
          });
      },
      error => {
          alert('Los archivos no se pudieron actualizar');
      }
  );
}

eliminarConfirmation() {
  Swal.fire({
    title: '¿Estas seguro que deseas eliminar tu cuenta?',
    text: '¡Esta acción es irreversible!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    backdrop: false
  }).then((result) => {
    if (result.value) {
        this.eliminar();
    }
  });
}

eliminar() {
  this.sidvi.usuario.eliminarUsuario(this.idUsuario)
  .subscribe( res => {
      if (res.type === _APIResponse.TypeEnum.SUCCESS) {
          Swal.fire({
              title: 'Eliminado',
              text: 'Su cuenta ha sido eliminada',
              icon: 'success',
              backdrop: false,
          });
          localStorage.clear();
          this.router.navigate(['./login']);
      }
  }, err => {console.log(err); });
}

}