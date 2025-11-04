package com.sakhi.store.repository;

import com.sakhi.store.model.SellerStore;
import com.sakhi.store.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SellerStoreRepository extends JpaRepository<SellerStore, Long> {
    Optional<SellerStore> findByUser(User user);
    boolean existsByStoreLink(String storeLink);
}
