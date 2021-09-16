#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
pub mod contract {
    use ink_prelude::vec::Vec as StdVec;

    #[ink(storage)]
    pub struct Data {
        value: bool,
        allowlist: StdVec<AccountId>,
    }

    impl Data {
        #[ink(constructor)]
        pub fn new(init_value: bool) -> Self {
            let mut allowlist = StdVec::with_capacity(1);
            allowlist.push(Self::env().caller());

            Self {
                value: init_value,
                allowlist,
            }
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        #[ink(message)]
        pub fn get_allowlist(&self) -> StdVec<AccountId> {
            self.allowlist.clone()
        }

        #[ink(message)]
        pub fn set(&mut self, new_value: bool) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
            self.value = new_value;
        }

        #[ink(message)]
        pub fn add_allowed_account(&mut self, new_account_id: AccountId) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
            self.allowlist.push(new_account_id);
        }

        #[ink(message)]
        pub fn remove_allowed_account(&mut self, account_id: AccountId) {
            assert!(self.allowlist.contains(&self.env().caller()), "not allowed");
            self.allowlist.retain(|a| a != &account_id);
        }
    }
}
