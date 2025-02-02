package com.cgm.infolab.db.repository;

import com.cgm.infolab.db.model.UserEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public UserRepository(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    /**
     * Metodo che aggiunge un utente al database.
     * @param user utente da salvare sul database.
     * @return chiave che è stata auto generata per l'utente creato, oppure -1 se l'utente inserito esisteva già.
     */
    public long add(UserEntity user) {
        SimpleJdbcInsert simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withSchemaName("infolab")
                .withTableName("users")
                .usingGeneratedKeyColumns("id");

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("username", user.getName());
        return (long)simpleJdbcInsert.executeAndReturnKey(parameters);
    }

    /**
     * Metodo che risale all'id di un utente dal suo nome
     * @param username da cui risalire all'id
     * @return id dell'utente con il nome passato a parametro. -1 in caso l'utente non esista.
     */
    public Optional<UserEntity> getByUsername(String username) {
        String query = "SELECT * FROM infolab.users WHERE username = ?";

        return Optional.ofNullable(
                jdbcTemplate.queryForObject(query, UserRepository::rowMapper, username));
    }

    /**
     * Metodo che ritorna un utente dal database, ricavandolo dall'id
     * @param id da cui risalire all'utente
     * @return oggetto User con il nome preso dal db. Ritorna null se l'user non esiste.
     */
    public Optional<UserEntity> getById(long id) {
        String query = "SELECT * FROM infolab.users WHERE id = ?";

        return Optional.ofNullable(
                jdbcTemplate.queryForObject(query, UserRepository::rowMapper, id));
    }

    /**
     * Rowmapper utilizzato nei metodi getByUsername e getById
     */
    private static UserEntity rowMapper(ResultSet rs, int rowNum) throws SQLException {
        UserEntity user = UserEntity.of(rs.getString("username"));
        user.setId(rs.getLong("id"));
        return user;
    }
}
