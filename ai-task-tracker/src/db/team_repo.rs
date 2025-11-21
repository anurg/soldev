use crate::models::{CreateTeamRequest, Team, TeamMember, TeamMemberWithUser, UpdateTeamRequest};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn create_team(pool: &PgPool, req: &CreateTeamRequest) -> Result<Team, sqlx::Error> {
    let team = sqlx::query_as::<_, Team>(
        r#"
        INSERT INTO teams (name, parent_team_id, manager_id)
        VALUES ($1, $2, $3)
        RETURNING *
        "#,
    )
    .bind(&req.name)
    .bind(req.parent_team_id)
    .bind(req.manager_id)
    .fetch_one(pool)
    .await?;

    Ok(team)
}

pub async fn find_team_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Team>, sqlx::Error> {
    let team = sqlx::query_as::<_, Team>(
        r#"
        SELECT * FROM teams WHERE id = $1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(team)
}

pub async fn list_teams(pool: &PgPool) -> Result<Vec<Team>, sqlx::Error> {
    let teams = sqlx::query_as::<_, Team>(
        r#"
        SELECT * FROM teams ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(teams)
}

pub async fn update_team(
    pool: &PgPool,
    id: Uuid,
    req: &UpdateTeamRequest,
) -> Result<Team, sqlx::Error> {
    let team = sqlx::query_as::<_, Team>(
        r#"
        UPDATE teams
        SET name = COALESCE($2, name),
            parent_team_id = COALESCE($3, parent_team_id),
            manager_id = COALESCE($4, manager_id),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .bind(&req.name)
    .bind(req.parent_team_id)
    .bind(req.manager_id)
    .fetch_one(pool)
    .await?;

    Ok(team)
}

pub async fn delete_team(pool: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        DELETE FROM teams WHERE id = $1
        "#,
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn add_team_member(
    pool: &PgPool,
    team_id: Uuid,
    user_id: Uuid,
) -> Result<TeamMember, sqlx::Error> {
    let member = sqlx::query_as::<_, TeamMember>(
        r#"
        INSERT INTO team_members (team_id, user_id)
        VALUES ($1, $2)
        RETURNING *
        "#,
    )
    .bind(team_id)
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    Ok(member)
}

pub async fn remove_team_member(
    pool: &PgPool,
    team_id: Uuid,
    user_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        DELETE FROM team_members WHERE team_id = $1 AND user_id = $2
        "#,
    )
    .bind(team_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(())
}



pub async fn list_team_members(pool: &PgPool, team_id: Uuid) -> Result<Vec<TeamMemberWithUser>, sqlx::Error> {
    let members = sqlx::query_as::<_, TeamMemberWithUser>(
        r#"
        SELECT tm.team_id, tm.user_id, tm.joined_at, u.full_name, u.email, u.role
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = $1
        "#,
    )
    .bind(team_id)
    .fetch_all(pool)
    .await?;

    Ok(members)
}
