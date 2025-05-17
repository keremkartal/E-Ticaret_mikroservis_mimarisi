# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from app.db.session import get_db
# from app.deps import require_roles
# from app.schemas.role import Role, RoleCreate, RoleUpdate
# from app.crud import role as crud_role
# from app.crud import permission as crud_perm
# from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate
# from typing import List

# router = APIRouter(
#     prefix="/roles",
#     tags=["Roles"],
#     dependencies=[Depends(require_roles("admin"))]
# )

# @router.get("/", response_model=List[RoleSchema])
# def list_roles(db: Session = Depends(get_db)):
#     roles = crud_role.list_roles(db)
#     result = []
#     for r in roles:
#         # ORM objesinden dict alıyoruz ve izin isimlerini ekliyoruz
#         data = {
#             "id": r.id,
#             "name": r.name,
#             "description": r.description,
#             "permissions": [p.name for p in r.permissions]
#         }
#         # Pydantic v2 için model_validate
#         result.append(RoleSchema.model_validate(data, from_attributes=True))
#     return result


# @router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
# def create_role(obj_in: RoleCreate, db: Session = Depends(get_db)):
#     if crud_role.get_by_name(db, obj_in.name):
#         raise HTTPException(400, "Role name already exists")
#     return crud_role.create(db, obj_in=obj_in)

# @router.get("/{role_id}", response_model=RoleSchema)
# def get_role(role_id: int, db: Session = Depends(get_db)):
#     r = crud_role.get(db, role_id)
#     if not r:
#         raise HTTPException(404, "Role not found")
#     data = {
#         "id": r.id,
#         "name": r.name,
#         "description": r.description,
#         "permissions": [p.name for p in r.permissions]
#     }
#     return RoleSchema.model_validate(data, from_attributes=True)

# @router.put("/{role_id}", response_model=Role)
# def update_role(role_id: int, obj_in: RoleUpdate, db: Session = Depends(get_db)):
#     role = crud_role.get(db, role_id)
#     if not role:
#         raise HTTPException(404, "Role not found")
#     return crud_role.update(db, db_obj=role, obj_in=obj_in)

# @router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_role(role_id: int, db: Session = Depends(get_db)):
#     role = crud_role.get(db, role_id)
#     if not role:
#         raise HTTPException(404, "Role not found")
#     crud_role.remove(db, role_id)


# # ──────────────────────── İzin Atama / Güncelleme ────────────────────────
# @router.put("/{role_id}/permissions", response_model=RoleSchema)
# def set_role_permissions(
#     role_id: int,
#     perm_ids: List[int],
#     db: Session = Depends(get_db)
# ):
#     """Assign list of permission IDs to role."""
#     r = crud_role.get(db, role_id)
#     if not r:
#         raise HTTPException(status_code=404, detail="Role not found")

#     # Validate and collect Permission objeleri
#     perms = []
#     for pid in perm_ids:
#         p = crud_perm.get(db, pid)
#         if not p:
#             raise HTTPException(status_code=400, detail=f"Permission ID {pid} invalid")
#         perms.append(p)

#     # İzinleri ata ve güncelle
#     r.permissions = perms
#     db.commit()
#     db.refresh(r)

#     # ORM -> DTO dönüşümü
#     return RoleSchema.model_validate(
#         {
#             **r.__dict__,
#             "permissions": [p.name for p in r.permissions]
#         },
#         from_attributes=True
#     )


# @router.post("/{role_id}/permissions/{perm_id}", response_model=RoleSchema)
# def add_permission(role_id: int, perm_id: int, db: Session = Depends(get_db)):
#     r = crud_role.get(db, role_id)
#     p = crud_perm.get(db, perm_id)
#     if not r or not p:
#         raise HTTPException(404, "Role or Permission not found")
#     if p not in r.permissions:
#         r.permissions.append(p)
#         db.commit(); db.refresh(r)
#     return RoleSchema.model_validate(
#         {"id":r.id, "name":r.name, "description":r.description,
#          "permissions":[x.name for x in r.permissions]},
#         from_attributes=True
#     )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List # List tipi için import eklendi

from app.db.session import get_db
from app.deps import require_roles # require_roles'un doğru tanımlandığını varsayıyoruz
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate # RoleSchema olarak alias verdik
from app.crud import role as crud_role
from app.crud import permission as crud_perm # crud_perm'in var olduğunu ve get metoduna sahip olduğunu varsayıyoruz
# app.models.role import Role as RoleModel # ORM modeli için gerekirse (genellikle crud içinde halledilir)

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(require_roles("admin"))] # "admin" rolünün var olduğunu varsayıyoruz
)

@router.get("/", response_model=List[RoleSchema])
def list_roles(db: Session = Depends(get_db)):
    """
    Tüm rolleri, ilişkili izinlerinin isimleriyle birlikte listeler.
    """
    roles_from_db = crud_role.list_roles(db)
    result = []
    for r in roles_from_db:
        # ORM objesinden (r) Pydantic modeline (RoleSchema) dönüşüm
        # r.permissions'ın Permission ORM objelerinden oluşan bir liste olduğunu varsayıyoruz
        # ve her Permission objesinin 'name' attribute'u olduğunu varsayıyoruz.
        permission_names = [p.name for p in r.permissions] if r.permissions else []
        role_data = {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "permissions": permission_names
        }
        # Pydantic V2'de .from_orm() yerine .model_validate() kullanılır (eğer dict'ten oluşturuluyorsa)
        # veya doğrudan ORM objesinden .model_validate(r, from_attributes=True)
        # Ancak burada özel bir dict oluşturduğumuz için bu şekilde validate etmek daha uygun.
        result.append(RoleSchema.model_validate(role_data))
    return result


@router.post("/", response_model=RoleSchema, status_code=status.HTTP_201_CREATED)
def create_role(obj_in: RoleCreate, db: Session = Depends(get_db)):
    """
    Yeni bir rol oluşturur. Rol adı benzersiz olmalıdır.
    Oluşturulan rol, başlangıçta hiç izne sahip olmayacaktır.
    """
    existing_role = crud_role.get_by_name(db, name=obj_in.name)
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu rol adı zaten mevcut."
        )
    created_role = crud_role.create(db, obj_in=obj_in)
    # crud_role.create'in Role ORM objesi döndürdüğünü varsayıyoruz.
    # Yanıt modeli RoleSchema olduğu için, ORM objesini Pydantic modeline dönüştürmemiz gerekiyor.
    # Başlangıçta izinleri boş olacak.
    role_data = {
        "id": created_role.id,
        "name": created_role.name,
        "description": created_role.description,
        "permissions": [] # Yeni oluşturulan rolün başlangıçta izni yok
    }
    return RoleSchema.model_validate(role_data)

@router.get("/{role_id}", response_model=RoleSchema)
def get_role(role_id: int, db: Session = Depends(get_db)):
    """
    Belirli bir ID'ye sahip rolü, ilişkili izinlerinin isimleriyle birlikte getirir.
    """
    db_role = crud_role.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    
    permission_names = [p.name for p in db_role.permissions] if db_role.permissions else []
    role_data = {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)

@router.put("/{role_id}", response_model=RoleSchema)
def update_role(role_id: int, obj_in: RoleUpdate, db: Session = Depends(get_db)):
    """
    Belirli bir ID'ye sahip rolü günceller.
    İzinler bu endpoint üzerinden güncellenmez, bunun için /permissions altındaki endpoint'ler kullanılır.
    """
    db_role = crud_role.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    
    # Eğer güncellenecek isim başka bir rolde varsa kontrol et (opsiyonel)
    if obj_in.name and obj_in.name != db_role.name:
        existing_role_with_new_name = crud_role.get_by_name(db, name=obj_in.name)
        if existing_role_with_new_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu rol adı zaten başka bir rol tarafından kullanılıyor."
            )
            
    updated_role_orm = crud_role.update(db, db_obj=db_role, obj_in=obj_in)
    
    permission_names = [p.name for p in updated_role_orm.permissions] if updated_role_orm.permissions else []
    role_data = {
        "id": updated_role_orm.id,
        "name": updated_role_orm.name,
        "description": updated_role_orm.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    """
    Belirli bir ID'ye sahip rolü siler.
    """
    db_role = crud_role.get(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    crud_role.remove(db, role_id=role_id)
    # Başarılı silme işleminde içerik döndürülmez (204 No Content)
    return None


# ──────────────────────── İzin Atama / Güncelleme ────────────────────────
@router.put("/{role_id}/permissions", response_model=RoleSchema)
def set_role_permissions(
    role_id: int,
    permission_ids: List[int], # İstek gövdesinde izin ID'lerinin listesi beklenir
    db: Session = Depends(get_db)
):
    """
    Bir role, ID'leri verilen izinlerin listesini atar.
    Mevcut tüm izinleri bu yeni listeyle değiştirir.
    """
    db_role = crud_role.get(db, role_id=role_id)
    if not db_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")

    # İzin ID'lerini doğrula ve Permission ORM objelerini topla
    permissions_to_assign = []
    for p_id in permission_ids:
        permission_obj = crud_perm.get(db, permission_id=p_id) # crud_perm.get'in ikinci argümanının permission_id olduğunu varsayıyoruz
        if not permission_obj:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"İzin ID {p_id} geçersiz.")
        permissions_to_assign.append(permission_obj)

    # Role'ün izinlerini güncelle
    db_role.permissions = permissions_to_assign # SQLAlchemy bu ilişkiyi yönetir
    db.add(db_role) # Değişiklikleri session'a ekle
    db.commit()
    db.refresh(db_role)

    # Yanıt için Pydantic modeline dönüştür
    permission_names = [p.name for p in db_role.permissions] if db_role.permissions else []
    role_data = {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)


@router.post("/{role_id}/permissions/{permission_id}", response_model=RoleSchema)
def add_permission_to_role(role_id: int, permission_id: int, db: Session = Depends(get_db)): # Fonksiyon adı daha açıklayıcı hale getirildi
    """
    Belirli bir role, belirli bir izni ekler (eğer zaten ekli değilse).
    """
    db_role = crud_role.get(db, role_id=role_id)
    db_permission = crud_perm.get(db, permission_id=permission_id) # crud_perm.get'in ikinci argümanının permission_id olduğunu varsayıyoruz

    if not db_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı")
    if not db_permission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İzin bulunamadı")

    # İzin rolde zaten var mı kontrol et
    # db_role.permissions listesinin Permission ORM objelerini içerdiğini varsayıyoruz.
    if db_permission not in db_role.permissions:
        db_role.permissions.append(db_permission)
        db.add(db_role) # Değişiklikleri session'a ekle
        db.commit()
        db.refresh(db_role)
    
    permission_names = [p.name for p in db_role.permissions] if db_role.permissions else []
    role_data = {
        "id": db_role.id,
        "name": db_role.name,
        "description": db_role.description,
        "permissions": permission_names
    }
    return RoleSchema.model_validate(role_data)